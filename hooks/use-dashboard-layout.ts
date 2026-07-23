import { useState, useEffect, useCallback } from 'react';
import { DASHBOARD_WIDGETS_REGISTRY, DashboardWidget } from '../lib/dashboard-widgets-registry';
import { getPresetLayoutForPersona } from '../lib/dashboard-layout-presets';

export interface UserWidgetLayout {
  id: string;
  visible: boolean;
  order: number;
  size: 'compact' | 'normal' | 'large';
}

export function useDashboardLayout(userId: string) {
  const storageKey = `floussi_dashboard_layout_${userId}`;
  const customizedKey = `floussi_dashboard_customized_${userId}`;
  const offeredKey = `floussi_dashboard_preset_offered_${userId}`;

  const getInitialLayout = useCallback((): UserWidgetLayout[] => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as UserWidgetLayout[];
          // Merge with registry to handle any newly added widgets or missing properties
          const merged = DASHBOARD_WIDGETS_REGISTRY.map(reg => {
            const userConfig = parsed.find(p => p.id === reg.id);
            return {
              id: reg.id,
              visible: userConfig ? userConfig.visible : reg.defaultVisible,
              order: userConfig && typeof userConfig.order === 'number' ? userConfig.order : reg.defaultOrder,
              size: userConfig && userConfig.size ? userConfig.size : (reg.sizeOptions[0] || 'normal')
            };
          });
          return merged.sort((a, b) => a.order - b.order);
        }
      } catch (e) {
        console.error("Failed to parse dashboard layout", e);
      }
    }

    // Fallback to defaults
    return DASHBOARD_WIDGETS_REGISTRY.map(reg => ({
      id: reg.id,
      visible: reg.defaultVisible,
      order: reg.defaultOrder,
      size: reg.sizeOptions[0] || 'normal'
    })).sort((a, b) => a.order - b.order);
  }, [storageKey]);

  const [layout, setLayout] = useState<UserWidgetLayout[]>([]);
  const [isCustomized, setIsCustomized] = useState<boolean>(false);
  const [hasBeenOfferedPersonaPreset, setHasBeenOfferedPersonaPreset] = useState<boolean>(false);

  // Initialize on mount/userId change
  useEffect(() => {
    setLayout(getInitialLayout());
    if (typeof window !== 'undefined') {
      setIsCustomized(localStorage.getItem(customizedKey) === 'true');
      setHasBeenOfferedPersonaPreset(localStorage.getItem(offeredKey) === 'true');
    }
  }, [userId, getInitialLayout, customizedKey, offeredKey]);

  const saveLayout = (newLayout: UserWidgetLayout[]) => {
    setLayout(newLayout);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(newLayout));
    }
  };

  const markAsCustomized = () => {
    setIsCustomized(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(customizedKey, 'true');
    }
  };

  const updateWidgetOrder = (newOrder: { id: string; order: number }[]) => {
    const updated = layout.map(w => {
      const match = newOrder.find(o => o.id === w.id);
      return match ? { ...w, order: match.order } : w;
    });
    markAsCustomized();
    saveLayout(updated.sort((a, b) => a.order - b.order));
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const updated = layout.map(w => {
      if (w.id === widgetId) {
        return { ...w, visible: !w.visible };
      }
      return w;
    });
    markAsCustomized();
    saveLayout(updated);
  };

  const setWidgetSize = (widgetId: string, size: 'compact' | 'normal' | 'large') => {
    const reg = DASHBOARD_WIDGETS_REGISTRY.find(r => r.id === widgetId);
    if (reg && reg.sizeOptions.includes(size)) {
      const updated = layout.map(w => {
        if (w.id === widgetId) {
          return { ...w, size };
        }
        return w;
      });
      markAsCustomized();
      saveLayout(updated);
    }
  };

  const applyPersonaPreset = (personaId: string) => {
    const preset = getPresetLayoutForPersona(personaId);
    saveLayout(preset);
    markAsCustomized();
    setHasBeenOfferedPersonaPreset(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(offeredKey, 'true');
    }
  };

  const dismissPersonaPreset = () => {
    setHasBeenOfferedPersonaPreset(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(offeredKey, 'true');
    }
  };

  const resetToDefault = () => {
    const defaults = DASHBOARD_WIDGETS_REGISTRY.map(reg => ({
      id: reg.id,
      visible: reg.defaultVisible,
      order: reg.defaultOrder,
      size: reg.sizeOptions[0] || 'normal'
    })).sort((a, b) => a.order - b.order);
    
    setIsCustomized(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(customizedKey);
    }
    saveLayout(defaults);
  };

  return {
    layout,
    isCustomized,
    hasBeenOfferedPersonaPreset,
    updateWidgetOrder,
    toggleWidgetVisibility,
    setWidgetSize,
    applyPersonaPreset,
    dismissPersonaPreset,
    resetToDefault
  };
}
