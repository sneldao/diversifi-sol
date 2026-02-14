// lib/ui/index.ts - UI Component exports

export * from './theme';
export * from './animations';
export * from './loading';

// Chart configuration
export const chartDefaults = {
  colors: {
    primary: '#6366f1',
    secondary: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
    chart: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
  },
  fonts: {
    mono: 'JetBrains Mono, monospace',
    sans: 'Inter, system-ui, sans-serif',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
};
