export interface FloussiTheme {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
}

export const FLOUSSI_THEMES: FloussiTheme[] = [
  {
    id: "default",
    name: "Default (Gris/Bleu)",
    description: "Ambiance professionnelle sobre et moderne.",
    primary: "#3B82F6",
    secondary: "#64748B",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#1E293B",
    accent: "#0EA5E9"
  },
  {
    id: "sahara",
    name: "Sahara (Orange désert)",
    description: "Les couleurs chaudes des dunes du grand Sud.",
    primary: "#F97316",
    secondary: "#D97706",
    background: "#FFF7ED",
    surface: "#FFFBEB",
    text: "#431407",
    accent: "#FB923C"
  },
  {
    id: "atlantic",
    name: "Atlantic (Bleu Océan)",
    description: "Le bleu profond de Casablanca et Essaouira.",
    primary: "#0EA5E9",
    secondary: "#0284C7",
    background: "#F0F9FF",
    surface: "#E0F2FE",
    text: "#082F49",
    accent: "#38BDF8"
  },
  {
    id: "atlas",
    name: "Atlas (Vert Montagne)",
    description: "Le vert ressourçant des montagnes de l'Atlas.",
    primary: "#10B981",
    secondary: "#059669",
    background: "#ECFDF5",
    surface: "#D1FAE5",
    text: "#064E3B",
    accent: "#34D399"
  },
  {
    id: "marrakech",
    name: "Marrakech (Rouge Médina)",
    description: "Le rouge brique authentique de la ville ocre.",
    primary: "#EF4444",
    secondary: "#DC2626",
    background: "#FEF2F2",
    surface: "#FEE2E2",
    text: "#450A0A",
    accent: "#F87171"
  },
  {
    id: "casablanca",
    name: "Casablanca (Bleu Moderne)",
    description: "Le bleu d'affaires de la capitale financière.",
    primary: "#6366F1",
    secondary: "#4F46E5",
    background: "#EEF2FF",
    surface: "#E0E7FF",
    text: "#1E1B4B",
    accent: "#818CF8"
  },
  {
    id: "fes",
    name: "Fès (Violet Ancien)",
    description: "La noblesse et l'histoire de la capitale spirituelle.",
    primary: "#8B5CF6",
    secondary: "#7C3AED",
    background: "#F5F3FF",
    surface: "#EDE9FE",
    text: "#2E1065",
    accent: "#A78BFA"
  },
  {
    id: "tanger",
    name: "Tanger (Cyan Port)",
    description: "La fraîcheur du détroit et du port méditerranéen.",
    primary: "#06B6D4",
    secondary: "#0891B2",
    background: "#ECFEFF",
    surface: "#CFFAFE",
    text: "#083344",
    accent: "#22D3EE"
  },
  {
    id: "agadir",
    name: "Agadir (Orange Coucher de Soleil)",
    description: "L'éclat d'un coucher de soleil sur la plage d'Agadir.",
    primary: "#F59E0B",
    secondary: "#D97706",
    background: "#FFFBEB",
    surface: "#FEF3C7",
    text: "#451A03",
    accent: "#FBBF24"
  },
  {
    id: "chefchaouen",
    name: "Chefchaouen (Bleu Ville)",
    description: "Le bleu envoûtant et rafraîchissant du Rif.",
    primary: "#3B82F6",
    secondary: "#60A5FA",
    background: "#EFF6FF",
    surface: "#DBEAFE",
    text: "#172554",
    accent: "#93C5FD"
  },
  {
    id: "ouarzazate",
    name: "Ouarzazate (Rose Désert)",
    description: "Le rose argileux de la kasbah de Taourirt.",
    primary: "#EC4899",
    secondary: "#DB2777",
    background: "#FDF2F8",
    surface: "#FCE7F3",
    text: "#500724",
    accent: "#F472B6"
  }
];

export interface CustomThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
  fontFamily: 'Inter' | 'Amiri' | 'Tajawal';
  borderRadius: number; // 0 to 24px
  density: 'compact' | 'comfortable';
  backgroundImageUrl?: string;
}

export function applyThemeToDOM(theme: FloussiTheme, customConfig?: CustomThemeConfig) {
  const root = document.documentElement;
  
  // Apply core theme colors as css variables
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-background', theme.background);
  root.style.setProperty('--color-surface', theme.surface);
  root.style.setProperty('--color-text', theme.text);
  root.style.setProperty('--color-accent', theme.accent);

  // If there's an elite custom configuration, apply it
  if (customConfig) {
    root.style.setProperty('--color-primary', customConfig.primary);
    root.style.setProperty('--color-secondary', customConfig.secondary);
    root.style.setProperty('--color-background', customConfig.background);
    root.style.setProperty('--color-surface', customConfig.surface);
    root.style.setProperty('--color-text', customConfig.text);
    root.style.setProperty('--color-accent', customConfig.accent);
    root.style.setProperty('--font-family-custom', customConfig.fontFamily === 'Inter' ? '"Inter", sans-serif' : customConfig.fontFamily === 'Amiri' ? '"Amiri", serif' : '"Tajawal", sans-serif');
    root.style.setProperty('--border-radius-custom', `${customConfig.borderRadius}px`);
    root.style.setProperty('--density-padding-multiplier', customConfig.density === 'compact' ? '0.75' : '1');
    if (customConfig.backgroundImageUrl) {
      root.style.setProperty('--background-image-custom', `url(${customConfig.backgroundImageUrl})`);
    } else {
      root.style.removeProperty('--background-image-custom');
    }
  } else {
    // Reset custom properties
    root.style.removeProperty('--font-family-custom');
    root.style.setProperty('--border-radius-custom', '16px');
    root.style.setProperty('--density-padding-multiplier', '1');
    root.style.removeProperty('--background-image-custom');
  }
}
