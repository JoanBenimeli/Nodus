import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

// Single persistence adapter shared by every store. Swap for MMKV here if a
// dev build is used (createJSONStorage(() => mmkvAdapter)).
export const storage = createJSONStorage(() => AsyncStorage);

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
