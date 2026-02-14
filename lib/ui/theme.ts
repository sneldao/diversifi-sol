// lib/ui/theme.ts - Theme configuration

export const themes = {
  dark: {
    name: 'dark',
    colors: {
      background: '#0a0a0a',
      surface: '#1a1a1a',
      surfaceHover: '#2a2a2a',
      primary: '#6366f1',
      primaryHover: '#818cf8',
      secondary: '#22c55e',
      danger: '#ef4444',
      warning: '#f59e0b',
      text: '#ffffff',
      textMuted: '#a1a1aa',
      border: '#27272a',
      accent: '#8b5cf6',
    },
  },
  light: {
    name: 'light',
    colors: {
      background: '#ffffff',
      surface: '#f4f4f5',
      surfaceHover: '#e4e4e7',
      primary: '#4f46e5',
      primaryHover: '#6366f1',
      secondary: '#16a34a',
      danger: '#dc2626',
      warning: '#d97706',
      text: '#18181b',
      textMuted: '#71717a',
      border: '#e4e4e7',
      accent: '#7c3aed',
    },
  },
};

export type ThemeName = keyof typeof themes;
export type Theme = typeof themes.dark;

export function getTheme(name: ThemeName): Theme {
  return themes[name] || themes.dark;
}

export function getCssVariables(theme: Theme): string {
  return Object.entries(theme.colors)
    .map(([key, value]) => `--color-${key}: ${value};`)
    .join('\n');
}
