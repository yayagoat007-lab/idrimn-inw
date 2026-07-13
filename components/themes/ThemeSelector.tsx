import React from 'react';
import { FLOUSSI_THEMES, FloussiTheme } from '../../lib/themes';
import { Sparkles, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';

interface ThemeSelectorProps {
  activeThemeId: string;
  onSelect: (themeId: string) => void;
  onUpgradeClick: () => void;
}

export function ThemeSelector({ activeThemeId, onSelect, onUpgradeClick }: ThemeSelectorProps) {
  const { profile } = useAuth();
  const currentTier = profile?.subscription_tier || 'free';
  const isElite = currentTier === 'elite';

  const handleThemeClick = (theme: FloussiTheme) => {
    // Non-default themes are locked for non-elite
    if (theme.id !== 'default' && !isElite) {
      onUpgradeClick();
    } else {
      onSelect(theme.id);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
      {FLOUSSI_THEMES.map((theme) => {
        const isActive = activeThemeId === theme.id;
        const isLocked = theme.id !== 'default' && !isElite;

        return (
          <div
            key={theme.id}
            onClick={() => handleThemeClick(theme)}
            className={`border cursor-pointer rounded-2xl p-4 transition-all relative flex flex-col justify-between group ${
              isActive
                ? 'border-emerald-500 bg-white shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500'
                : 'border-slate-150 hover:border-slate-300 bg-white hover:shadow-xs'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-black text-slate-800 tracking-tight">{theme.name}</span>
                {isActive && (
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500 fill-emerald-50" />
                )}
                {isLocked && (
                  <div className="w-5 h-5 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 border border-amber-200">
                    <Lock className="w-3 h-3" />
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mb-4">
                {theme.description}
              </p>
            </div>

            {/* Colors Preview dots */}
            <div className="flex items-center gap-1.5 mt-auto">
              <div className="w-4 h-4 rounded-full border border-slate-200 shadow-2xs" style={{ backgroundColor: theme.primary }} title="Primary" />
              <div className="w-4 h-4 rounded-full border border-slate-200 shadow-2xs" style={{ backgroundColor: theme.secondary }} title="Secondary" />
              <div className="w-4 h-4 rounded-full border border-slate-200 shadow-2xs" style={{ backgroundColor: theme.background }} title="Background" />
              <div className="w-4 h-4 rounded-full border border-slate-200 shadow-2xs" style={{ backgroundColor: theme.accent }} title="Accent" />
            </div>

            {/* Hover overlay if locked */}
            {isLocked && (
              <div className="absolute inset-0 bg-slate-900/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[0.5px]">
                <div className="bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Débloquer avec Elite</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
export default ThemeSelector;
