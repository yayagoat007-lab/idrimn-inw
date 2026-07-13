import { useState, useCallback } from 'react';
import { useAuthContext } from '../components/auth/AuthProvider';
import { Profile, SubscriptionTier } from '../types';

/**
 * Main useAuth hook for general usage and compatibility with App.tsx
 */
export function useAuth() {
  const context = useAuthContext();
  
  const setLanguage = useCallback((lang: 'fr' | 'darija') => {
    context.updateProfile({ preferred_language: lang });
  }, [context]);

  const upgradeSubscription = useCallback((tier: SubscriptionTier) => {
    context.updateProfile({
      subscription_tier: tier,
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }, [context]);

  return {
    user: context.user,
    profile: context.profile,
    loading: context.loading,
    updateProfile: context.updateProfile,
    setLanguage,
    upgradeSubscription,
    logout: context.logout,
    login: context.login,
    register: context.register
  };
}

/**
 * useUser hook returning the active user and profile
 */
export function useUser() {
  const { user, profile } = useAuthContext();
  return { user, profile };
}

/**
 * useSession hook returning active session information
 */
export function useSession() {
  const { user } = useAuthContext();
  return user ? { user, expires_at: null } : null;
}

/**
 * useIsAuthenticated hook returning whether a user session is active
 */
export function useIsAuthenticated() {
  const { user } = useAuthContext();
  return !!user;
}

/**
 * useIsOnboarded hook checking if the user profile contains all essential onboarding fields
 */
export function useIsOnboarded() {
  const { profile } = useAuthContext();
  if (!profile) return false;
  return !!(profile.full_name && profile.phone && profile.city && profile.preferred_language);
}

/**
 * useSubscription hook returning the user's current subscription tier
 */
export function useSubscription() {
  const { profile } = useAuthContext();
  return profile?.subscription_tier || 'free';
}

/**
 * useHasAds hook returning true if the user's plan is the Free ("Siyahi") plan
 */
export function useHasAds() {
  const { profile } = useAuthContext();
  return !profile || profile.subscription_tier === 'free';
}

/**
 * useLogin mutation hook mimicking React Query (TanStack Query) mutation structure
 */
export function useLogin() {
  const { login } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(async (variables: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await login(variables.email, variables.password);
      return res;
    } catch (err: any) {
      const formattedError = new Error(err.message || 'Échec de connexion');
      setError(formattedError);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const mutate = useCallback((variables: { email: string; password: string }, options?: { onSuccess?: (data: any) => void; onError?: (err: Error) => void }) => {
    mutateAsync(variables)
      .then((data) => {
        if (options?.onSuccess) options.onSuccess(data);
      })
      .catch((err) => {
        if (options?.onError) options.onError(err);
      });
  }, [mutateAsync]);

  return { mutate, mutateAsync, isLoading, error };
}

/**
 * useRegister mutation hook mimicking React Query
 */
export function useRegister() {
  const { register } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(async (variables: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await register(variables);
      return res;
    } catch (err: any) {
      const formattedError = new Error(err.message || "Échec de l'inscription");
      setError(formattedError);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  }, [register]);

  const mutate = useCallback((variables: any, options?: { onSuccess?: (data: any) => void; onError?: (err: Error) => void }) => {
    mutateAsync(variables)
      .then((data) => {
        if (options?.onSuccess) options.onSuccess(data);
      })
      .catch((err) => {
        if (options?.onError) options.onError(err);
      });
  }, [mutateAsync]);

  return { mutate, mutateAsync, isLoading, error };
}

/**
 * useLogout mutation hook mimicking React Query
 */
export function useLogout() {
  const { logout } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logout();
    } catch (err: any) {
      const formattedError = new Error(err.message || 'Échec de déconnexion');
      setError(formattedError);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const mutate = useCallback((_variables: void, options?: { onSuccess?: () => void; onError?: (err: Error) => void }) => {
    mutateAsync()
      .then(() => {
        if (options?.onSuccess) options.onSuccess();
      })
      .catch((err) => {
        if (options?.onError) options.onError(err);
      });
  }, [mutateAsync]);

  return { mutate, mutateAsync, isLoading, error };
}

/**
 * useUpdateProfile mutation hook mimicking React Query
 */
export function useUpdateProfile() {
  const { updateProfile } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(async (variables: Partial<Profile>) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateProfile(variables);
    } catch (err: any) {
      const formattedError = new Error(err.message || 'Échec de la mise à jour');
      setError(formattedError);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  }, [updateProfile]);

  const mutate = useCallback((variables: Partial<Profile>, options?: { onSuccess?: () => void; onError?: (err: Error) => void }) => {
    mutateAsync(variables)
      .then(() => {
        if (options?.onSuccess) options.onSuccess();
      })
      .catch((err) => {
        if (options?.onError) options.onError(err);
      });
  }, [mutateAsync]);

  return { mutate, mutateAsync, isLoading, error };
}

/**
 * useSendOTP mutation hook mimicking SMS OTP transmission
 */
export function useSendOTP() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(async (variables: { phone: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`[SMS OTP] Sending verification code to ${variables.phone}...`);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { success: true };
    } catch (err: any) {
      const formattedError = new Error(err.message || "Échec d'envoi OTP");
      setError(formattedError);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutate = useCallback((variables: { phone: string }, options?: { onSuccess?: (data: any) => void; onError?: (err: Error) => void }) => {
    mutateAsync(variables)
      .then((data) => {
        if (options?.onSuccess) options.onSuccess(data);
      })
      .catch((err) => {
        if (options?.onError) options.onError(err);
      });
  }, [mutateAsync]);

  return { mutate, mutateAsync, isLoading, error };
}

/**
 * useVerifyOTP mutation hook mimicking SMS OTP verification
 */
export function useVerifyOTP() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(async (variables: { code: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`[SMS OTP] Verifying code ${variables.code}...`);
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (variables.code === '123456' || variables.code.length === 6) {
        return { verified: true };
      }
      throw new Error('Code de vérification incorrect');
    } catch (err: any) {
      const formattedError = new Error(err.message || 'Échec de vérification OTP');
      setError(formattedError);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutate = useCallback((variables: { code: string }, options?: { onSuccess?: (data: any) => void; onError?: (err: Error) => void }) => {
    mutateAsync(variables)
      .then((data) => {
        if (options?.onSuccess) options.onSuccess(data);
      })
      .catch((err) => {
        if (options?.onError) options.onError(err);
      });
  }, [mutateAsync]);

  return { mutate, mutateAsync, isLoading, error };
}
