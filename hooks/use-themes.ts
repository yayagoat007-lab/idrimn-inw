import { useState, useEffect } from 'react';
import { FLOUSSI_THEMES, FloussiTheme, CustomThemeConfig, applyThemeToDOM } from '../lib/themes';
import { OfflineDB } from '../lib/offline-db';
import { supabase } from '../lib/supabase';

export function useThemes(userId: string = "mock-user-id-9999") {
  const [activeThemeId, setActiveThemeId] = useState<string>("default");
  const [customConfig, setCustomConfig] = useState<CustomThemeConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadThemeSettings() {
      setLoading(true);
      
      let localThemeId = await OfflineDB.get<string>('active_theme_id');
      let localCustom = await OfflineDB.get<CustomThemeConfig>('custom_theme_config');

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferred_theme, custom_theme_config')
          .eq('id', userId)
          .single();
        if (!error && data) {
          if (data.preferred_theme) localThemeId = data.preferred_theme;
          if (data.custom_theme_config) localCustom = data.custom_theme_config;
        }
      } catch (_) {}

      if (!localThemeId) localThemeId = "default";
      
      setActiveThemeId(localThemeId);
      setCustomConfig(localCustom || null);
      
      // Apply to DOM
      const targetTheme = FLOUSSI_THEMES.find(t => t.id === localThemeId) || FLOUSSI_THEMES[0];
      applyThemeToDOM(targetTheme, localCustom || undefined);
      
      setLoading(false);
    }
    loadThemeSettings();
  }, [userId]);

  const selectTheme = async (themeId: string, custom?: CustomThemeConfig) => {
    setActiveThemeId(themeId);
    if (custom) {
      setCustomConfig(custom);
    } else {
      setCustomConfig(null);
    }

    const targetTheme = FLOUSSI_THEMES.find(t => t.id === themeId) || FLOUSSI_THEMES[0];
    applyThemeToDOM(targetTheme, custom || undefined);

    await OfflineDB.set('active_theme_id', themeId);
    if (custom) {
      await OfflineDB.set('custom_theme_config', custom);
    } else {
      await OfflineDB.delete('custom_theme_config');
    }

    try {
      await supabase
        .from('profiles')
        .update({ 
          preferred_theme: themeId,
          custom_theme_config: custom || null
        })
        .eq('id', userId);
    } catch (_) {}
  };

  const currentTheme = FLOUSSI_THEMES.find(t => t.id === activeThemeId) || FLOUSSI_THEMES[0];

  return {
    themes: FLOUSSI_THEMES,
    activeThemeId,
    currentTheme,
    customConfig,
    loading,
    selectTheme
  };
}
