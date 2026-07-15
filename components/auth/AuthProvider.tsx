import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { OfflineDB } from '../../lib/offline-db';
import { Profile } from '../../types';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface AuthContextType {
  user: any;
  profile: Profile | null;
  loading: boolean;
  isOnline: boolean;
  sessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [reconnectEmail, setReconnectEmail] = useState<string>('');
  const [reconnectPassword, setReconnectPassword] = useState<string>('');
  const [reconnecting, setReconnecting] = useState<boolean>(false);
  const [reconnectError, setReconnectError] = useState<string>('');

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync of local queues to Supabase
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync data function
  const triggerSync = async () => {
    try {
      console.log('[Offline Sync] App is online. Processing sync queue...');
      const queue = await OfflineDB.getSyncQueue();
      if (queue.length === 0) return;

      const syncedItemIds: string[] = [];

      for (const item of queue) {
        try {
          if (item.action === 'delete') {
            await supabase.from(item.table).delete().eq('id', item.data.id || item.id);
          } else {
            // 'insert' or 'update'
            await supabase.from(item.table).upsert(item.data);
          }
          syncedItemIds.push(item.id);
        } catch (syncErr) {
          console.error(`[Offline Sync] Failed to sync item ${item.id} on table ${item.table}:`, syncErr);
          // Keep in queue to retry later if sync failed
        }
      }

      if (syncedItemIds.length > 0) {
        await OfflineDB.clearSyncQueue(syncedItemIds);
      }
      console.log(`[Offline Sync] Sync complete! Successfully synced ${syncedItemIds.length}/${queue.length} items.`);
    } catch (err) {
      console.error('[Offline Sync] Error syncing queue:', err);
    }
  };

  // Auth initialization
  useEffect(() => {
    async function initAuth() {
      setLoading(true);
      try {
        // Load cached user profile from IndexedDB first
        const cachedUser = await OfflineDB.get<any>('auth_user');
        const cachedProfile = await OfflineDB.get<Profile>('user_profile');

        if (cachedUser) {
          setUser(cachedUser);
        }
        if (cachedProfile) {
          setProfile(cachedProfile);
        }

        // Validate session with Supabase
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

        if (error) {
          // If we had a cached user but got a clear auth error, check if expired
          if (cachedUser && isOnline) {
            setSessionExpired(true);
          }
        } else if (supabaseUser) {
          setUser(supabaseUser);
          await OfflineDB.set('auth_user', supabaseUser);

          // Get profile from Supabase or create it
          const { data: remoteProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

          if (remoteProfile) {
            setProfile(remoteProfile);
            await OfflineDB.set('user_profile', remoteProfile);
          } else if (cachedProfile) {
            // Upsert local profile to remote
            await supabase.from('profiles').upsert(cachedProfile);
          }
        } else {
          // No user, make sure cached user is cleared
          setUser(null);
          setProfile(null);
          await OfflineDB.delete('auth_user');
          await OfflineDB.delete('user_profile');
        }
      } catch (err) {
        console.error('[Auth Init] Error during auth init:', err);
      } finally {
        setLoading(false);
      }

      // Listen for Supabase session changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          if (event === 'SIGNED_IN' && session?.user) {
            setUser(session.user);
            await OfflineDB.set('auth_user', session.user);
            setSessionExpired(false);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
            setSessionExpired(false);
            await OfflineDB.delete('auth_user');
            await OfflineDB.delete('user_profile');
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            setUser(session.user);
            await OfflineDB.set('auth_user', session.user);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }

    initAuth();
  }, [isOnline]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const updated: Profile = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString()
    };

    setProfile(updated);
    await OfflineDB.set('user_profile', updated);

    if (isOnline) {
      try {
        await supabase.from('profiles').upsert(updated);
      } catch (e) {
        await OfflineDB.addToSyncQueue({
          table: 'profiles',
          action: 'update',
          data: updated
        });
      }
    } else {
      await OfflineDB.addToSyncQueue({
        table: 'profiles',
        action: 'update',
        data: updated
      });
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data?.user) {
      setUser(data.user);
      await OfflineDB.set('auth_user', data.user);

      // Check profile
      const { data: remoteProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (remoteProfile) {
        setProfile(remoteProfile);
        await OfflineDB.set('user_profile', remoteProfile);
      } else {
        const defaultProf: Profile = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.user.user_metadata?.full_name || email.split('@')[0])}`,
          phone: null,
          city: null,
          preferred_language: 'fr',
          currency: 'MAD',
          subscription_tier: 'free',
          subscription_expires_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(defaultProf);
        await OfflineDB.set('user_profile', defaultProf);
        await supabase.from('profiles').upsert(defaultProf);
      }
    }
    return data;
  };

  const register = async (regData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email: regData.email,
      password: regData.password,
      options: {
        data: {
          full_name: regData.fullName,
          phone: regData.phone,
          city: regData.city
        }
      }
    });

    if (error) throw error;

    if (data?.user) {
      setUser(data.user);
      await OfflineDB.set('auth_user', data.user);

      // Generate default avatar initials URL
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(regData.fullName)}`;

      const newProf: Profile = {
        id: data.user.id,
        email: regData.email,
        full_name: regData.fullName,
        avatar_url: avatarUrl,
        phone: regData.phone,
        city: regData.city,
        preferred_language: 'fr',
        currency: 'MAD',
        subscription_tier: 'free',
        subscription_expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setProfile(newProf);
      await OfflineDB.set('user_profile', newProf);
      await supabase.from('profiles').upsert(newProf);
    }
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSessionExpired(false);
    await OfflineDB.delete('auth_user');
    await OfflineDB.delete('user_profile');
  };

  const handleReconnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setReconnecting(true);
    setReconnectError('');
    try {
      await login(reconnectEmail, reconnectPassword);
      setSessionExpired(false);
      setReconnectPassword('');
    } catch (err: any) {
      setReconnectError(err.message || 'Identifiants incorrects');
    } finally {
      setReconnecting(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isOnline,
        sessionExpired,
        setSessionExpired,
        updateProfile,
        logout,
        login,
        register
      }}
    >
      {children}

      {/* RECONNECT MODAL IF SESSION EXPIRED */}
      {sessionExpired && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-950">Session expirée</h3>
                <p className="text-[11px] text-slate-500 font-medium">Veuillez vous reconnecter pour sécuriser vos données Floussi</p>
              </div>
            </div>

            <form onSubmit={handleReconnect} className="space-y-4 text-xs font-semibold text-slate-700">
              {reconnectError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl font-medium text-[11px]">
                  {reconnectError}
                </div>
              )}

              <div>
                <label className="block mb-1 font-bold">Email</label>
                <input
                  type="email"
                  required
                  value={reconnectEmail}
                  onChange={(e) => setReconnectEmail(e.target.value)}
                  placeholder="Ex: karim.alaoui@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold">Mot de passe</label>
                <input
                  type="password"
                  required
                  value={reconnectPassword}
                  onChange={(e) => setReconnectPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                >
                  Déconnexion
                </button>
                <button
                  type="submit"
                  disabled={reconnecting}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-600/15 flex items-center justify-center gap-1.5"
                >
                  {reconnecting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Connexion...</span>
                    </>
                  ) : (
                    <span>Se connecter</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
