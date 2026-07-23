"use client";

import React from 'react';
import { useAuth } from '../../../../hooks/use-auth';
import { useThemes } from '../../../../hooks/use-themes';
import { ThemeSelector } from '../../../../components/themes/ThemeSelector';
import { ThemePreview } from '../../../../components/themes/ThemePreview';
import { ThemeCustomizer } from '../../../../components/themes/ThemeCustomizer';
import { Palette, Sparkles, AlertCircle } from 'lucide-react';
import { Language } from '../../../../lib/i18n';
import { useTranslation } from '../../../../hooks/use-translation';

interface SettingsThemesPageProps {
  language?: Language;
}

export default function SettingsThemesPage({ language: propLanguage }: SettingsThemesPageProps) {
  const { lang } = useTranslation();
  const language = propLanguage || lang;
  const { profile, upgradeSubscription } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";
  const currentTier = profile?.subscription_tier || 'free';

  const {
    activeThemeId,
    currentTheme,
    customConfig,
    loading,
    selectTheme
  } = useThemes(userId);

  const handleUpgradeClick = () => {
    upgradeSubscription('elite');
    alert(language === 'darija' 
      ? "Mabrouk! Rje3ti Floussi Elite b 200 DH f-cchar. T9der tbeddel bghiti." 
      : "Félicitations ! Vous venez de débloquer Floussi Elite pour 200 DH/mois. Vous pouvez maintenant personnaliser à l'infini."
    );
  };

  if (loading) {
    return <div className="text-center py-10 font-bold text-slate-400">{language === 'darija' ? "Khay jme3 l-thémat..." : "Chargement des thèmes..."}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Palette className="text-emerald-600" />
          <span>{language === 'darija' ? "Thémat d l-Maghrib o s-Sifat l-Bassariya" : "Thèmes Marocains & Identité Visuelle"}</span>
        </h2>
        <p className="text-xs text-slate-500">
          {language === 'darija' 
            ? "Beddel l-alwan dyal Floussi b l-alwan d l-khir d l-Maghrib" 
            : "Habillez votre application Floussi aux couleurs des richesses de notre pays ou créez votre palette sur-mesure"}
        </p>
      </div>

      {/* Grid: Left Themes list, Right live mockup and elite customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <ThemeSelector
            activeThemeId={activeThemeId}
            onSelect={(id) => selectTheme(id)}
            onUpgradeClick={handleUpgradeClick}
          />
        </div>

        <div className="space-y-6">
          {/* Live Preview of active theme */}
          <ThemePreview theme={currentTheme} />

          {/* Elite Customizer */}
          <ThemeCustomizer
            currentTheme={currentTheme}
            initialConfig={customConfig}
            onSave={(cfg) => selectTheme(activeThemeId, cfg)}
            isLocked={currentTier !== 'elite'}
            onUpgradeClick={handleUpgradeClick}
          />
        </div>
      </div>
    </div>
  );
}
