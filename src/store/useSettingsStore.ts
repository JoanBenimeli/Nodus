import { Appearance } from 'react-native';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage } from './storage';

type Mode = 'light' | 'dark';

type SettingsState = {
  mode: Mode;
  toggleMode: () => void;
  setMode: (m: Mode) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      mode: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
      toggleMode: () => set((s) => ({ mode: s.mode === 'dark' ? 'light' : 'dark' })),
      setMode: (mode) => set({ mode }),
    }),
    { name: 'nodus-settings', storage },
  ),
);
