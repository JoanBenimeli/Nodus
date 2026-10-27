import { useMemo } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export type ThemeMode = 'light' | 'dark';

export type Palette = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  danger: string;
  overlay: string;
};

export const palettes: Record<ThemeMode, Palette> = {
  light: {
    bg: '#F5F6F8',
    surface: '#FFFFFF',
    surfaceAlt: '#ECEEF2',
    text: '#0E1116',
    textMuted: '#6B7280',
    border: '#E2E5EA',
    danger: '#E5334F',
    overlay: 'rgba(10,12,16,0.45)',
  },
  dark: {
    bg: '#0A0C0F',
    surface: '#14181D',
    surfaceAlt: '#1D232B',
    text: '#F2F4F7',
    textMuted: '#8B94A3',
    border: '#262D37',
    danger: '#FF5A73',
    overlay: 'rgba(0,0,0,0.65)',
  },
};

export const accents = {
  habits: '#7C5CFF',
  diet: '#19C39B',
  finance: '#3D8BFF',
} as const;

export const macroColors = {
  calories: '#FFB020',
  protein: '#7C5CFF',
  carbs: '#22D3EE',
  fat: '#FF6B9A',
} as const;

export const swatches = [
  '#7C5CFF',
  '#3D8BFF',
  '#19C39B',
  '#FFB020',
  '#FF6B9A',
  '#22D3EE',
  '#FF7A45',
  '#A3E635',
];

export const radius = { sm: 10, md: 16, lg: 24, xl: 32 };
export const SCREEN_PAD = 20;

export function useTheme() {
  const mode = useSettingsStore((s) => s.mode);
  const toggle = useSettingsStore((s) => s.toggleMode);
  return useMemo(
    () => ({ mode, isDark: mode === 'dark', colors: palettes[mode], toggle }),
    [mode, toggle],
  );
}
