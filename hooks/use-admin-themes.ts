import { useState, useEffect } from 'react';

export interface AdminTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardColor: string;
  isLocked: boolean;
  isActive: boolean;
}

const INITIAL_THEMES: AdminTheme[] = [
  { id: 'theme-classic', name: 'Vert Floussi Classique', primaryColor: '#10b981', secondaryColor: '#059669', backgroundColor: '#f8fafc', cardColor: '#ffffff', isLocked: false, isActive: true },
  { id: 'theme-majorelle', name: 'Bleu Majorelle', primaryColor: '#2563eb', secondaryColor: '#1d4ed8', backgroundColor: '#f1f5f9', cardColor: '#ffffff', isLocked: true, isActive: true },
  { id: 'theme-sahara', name: 'Or Sahara', primaryColor: '#f59e0b', secondaryColor: '#d97706', backgroundColor: '#fefbf3', cardColor: '#ffffff', isLocked: true, isActive: true },
  { id: 'theme-oasis', name: 'Palmeraie Oasis', primaryColor: '#0f766e', secondaryColor: '#0d9488', backgroundColor: '#f0fdf4', cardColor: '#ffffff', isLocked: true, isActive: true },
  { id: 'theme-fes', name: 'Bleu Royal de Fès', primaryColor: '#1e3a8a', secondaryColor: '#1e40af', backgroundColor: '#fafafa', cardColor: '#ffffff', isLocked: true, isActive: true }
];

export function useAdminThemes() {
  const [themes, setThemes] = useState<AdminTheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('floussi_admin_themes');
    if (saved) {
      setThemes(JSON.parse(saved));
    } else {
      setThemes(INITIAL_THEMES);
      localStorage.setItem('floussi_admin_themes', JSON.stringify(INITIAL_THEMES));
    }
    setLoading(false);
  }, []);

  const saveThemes = (updated: AdminTheme[]) => {
    setThemes(updated);
    localStorage.setItem('floussi_admin_themes', JSON.stringify(updated));
  };

  const createTheme = (data: Omit<AdminTheme, 'id' | 'isActive'>) => {
    const newTheme: AdminTheme = {
      ...data,
      id: `theme-${Date.now()}`,
      isActive: true
    };
    saveThemes([...themes, newTheme]);
  };

  const updateTheme = (id: string, updates: Partial<AdminTheme>) => {
    const updated = themes.map(t => t.id === id ? { ...t, ...updates } : t);
    saveThemes(updated);
  };

  const deleteTheme = (id: string) => {
    const updated = themes.filter(t => t.id !== id);
    saveThemes(updated);
  };

  return { themes, loading, createTheme, updateTheme, deleteTheme };
}
