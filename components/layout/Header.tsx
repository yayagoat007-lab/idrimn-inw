import { Wifi, WifiOff, Bell, Languages, Check, ArrowRight, Wallet, HelpCircle, Camera } from 'lucide-react';
import { getTranslation, Language } from '../../lib/i18n';
import { Profile } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useState } from 'react';
import { NotificationBell } from '../notifications/NotificationBell';
import { SearchTriggerButton } from '../search/SearchTriggerButton';
import { SubscriptionStatusBadge } from '../shared/SubscriptionStatusBadge';

interface HeaderProps {
  profile: Profile | null;
  isOnline: boolean;
  isSyncing: boolean;
  totalBalance: number;
  monthlyIncome: number;
  monthlySpent: number;
  language: Language;
  setLanguage: (lang: Language) => void;
  onNavigate: (route: string) => void;
  onScanClick?: () => void;
  onSearchClick: () => void;
}

export function Header({
  profile,
  isOnline,
  isSyncing,
  totalBalance,
  monthlyIncome,
  monthlySpent,
  language,
  setLanguage,
  onNavigate,
  onScanClick,
  onSearchClick
}: HeaderProps) {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search or greeting */}
      <div className="flex items-center justify-between md:justify-start gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight flex items-center gap-1.5">
            Ahlan, {profile?.full_name || "Moussafer"} ! 🇲🇦
          </h2>
          <div className="mt-1">
            <SubscriptionStatusBadge 
              tier={profile?.subscription_tier || 'free'} 
              language={language as 'fr' | 'darija'} 
              variant="compact"
            />
          </div>
        </div>

        {/* Sync / Offline Indicators */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${isSyncing ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
              <Wifi size={12} />
              <span>{isSyncing ? "Sync..." : "Synchronisé"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-600 animate-pulse">
              <WifiOff size={12} />
              <span>Hors-ligne (IndexedDB)</span>
            </div>
          )}
        </div>
      </div>

      {/* Top statistics overview */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl text-center md:min-w-[400px]">
        <div>
          <span className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider">
            {getTranslation('totalBalance', language)}
          </span>
          <span className="text-xs md:text-sm font-semibold text-gray-900">
            {formatCurrency(totalBalance)}
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider">
            {getTranslation('monthlyIncome', language)}
          </span>
          <span className="text-xs md:text-sm font-semibold text-emerald-600">
            +{formatCurrency(monthlyIncome)}
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider">
            {getTranslation('monthlySpent', language)}
          </span>
          <span className="text-xs md:text-sm font-semibold text-rose-600">
            -{formatCurrency(monthlySpent)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 self-end md:self-center">
        {/* Search trigger */}
        <SearchTriggerButton onClick={onSearchClick} language={language} />

        {/* Scan receipt button */}
        {onScanClick && (
          <button
            onClick={onScanClick}
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
            title="Scanner un ticket"
          >
            <Camera size={18} />
          </button>
        )}

        {/* Language switch */}
        <div className="relative">
          <button 
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <Languages size={18} />
            <span>{language === 'fr' ? "FR" : "Darija"}</span>
          </button>
          
          {showLanguageMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg p-1 z-50">
              <button
                onClick={() => { setLanguage('fr'); setShowLanguageMenu(false); }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-left font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span>Français</span>
                {language === 'fr' && <Check size={14} className="text-emerald-600" />}
              </button>
              <button
                onClick={() => { setLanguage('darija'); setShowLanguageMenu(false); }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-left font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span>Darija (Latin)</span>
                {language === 'darija' && <Check size={14} className="text-emerald-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <NotificationBell
          userId={profile?.id || "mock-user-id-9999"}
          language={language}
          onNavigate={onNavigate}
        />

        {/* Avatar */}
        <button 
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors border border-gray-100"
        >
          <img
            src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
            alt="Profile Avatar"
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="text-xs font-semibold text-gray-700 hidden sm:inline">
            Compte
          </span>
        </button>
      </div>
    </header>
  );
}
export default Header;
