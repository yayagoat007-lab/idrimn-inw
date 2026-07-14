import { useState, useEffect } from 'react';
import { FLOUSSI_THEMES, applyThemeToDOM } from '../lib/themes';
import { OfflineDB } from '../lib/offline-db';

/**
 * Hook to handle auto-theme switching based on local time.
 * Switches to Dark Mode or pure OLED Black between 20h (8 PM) and 6h (6 AM).
 * Allows users to choose pure black (OLED) for AMOLED screens to conserve power.
 */
export function useAutoTheme() {
  const [autoNightEnabled, setAutoNightEnabled] = useState<boolean>(true);
  const [oledEnabled, setOledEnabled] = useState<boolean>(false);
  const [isNightTime, setIsNightTime] = useState<boolean>(false);

  useEffect(() => {
    // Load local settings
    const loadSettings = async () => {
      const storedAutoNight = localStorage.getItem('theme_auto_night') !== 'false'; // Defaults to true
      const storedOled = localStorage.getItem('theme_oled_black') === 'true'; // Defaults to false
      
      setAutoNightEnabled(storedAutoNight);
      setOledEnabled(storedOled);
      checkTimeAndApply(storedAutoNight, storedOled);
    };

    loadSettings();

    // Check time periodically every 5 minutes
    const interval = setInterval(() => {
      checkTimeAndApply(autoNightEnabled, oledEnabled);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoNightEnabled, oledEnabled]);

  const checkTimeAndApply = async (autoNight: boolean, oled: boolean) => {
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 20 || currentHour < 6;
    setIsNightTime(isNight);

    if (autoNight && isNight) {
      const targetThemeId = oled ? 'oled' : 'dark';
      const targetTheme = FLOUSSI_THEMES.find(t => t.id === targetThemeId);
      if (targetTheme) {
        console.log(`[AutoTheme] Applying Night theme: ${targetThemeId} (Hour: ${currentHour}:00)`);
        applyThemeToDOM(targetTheme);
      }
    } else {
      // Revert to user preferred theme if not night time or if auto night is disabled
      const preferredThemeId = await OfflineDB.get<string>('active_theme_id') || 'default';
      const customConfig = await OfflineDB.get<any>('custom_theme_config');
      const preferredTheme = FLOUSSI_THEMES.find(t => t.id === preferredThemeId) || FLOUSSI_THEMES[0];
      applyThemeToDOM(preferredTheme, customConfig || undefined);
    }
  };

  const toggleAutoNight = (enable: boolean) => {
    setAutoNightEnabled(enable);
    localStorage.setItem('theme_auto_night', enable ? 'true' : 'false');
    checkTimeAndApply(enable, oledEnabled);
  };

  const toggleOled = (enable: boolean) => {
    setOledEnabled(enable);
    localStorage.setItem('theme_oled_black', enable ? 'true' : 'false');
    checkTimeAndApply(autoNightEnabled, enable);
  };

  return {
    autoNightEnabled,
    oledEnabled,
    isNightTime,
    toggleAutoNight,
    toggleOled
  };
}
