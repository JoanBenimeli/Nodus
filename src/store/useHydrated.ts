import { useEffect, useState } from 'react';
import { useDietStore } from './useDietStore';
import { useFinanceStore } from './useFinanceStore';
import { useHabitStore } from './useHabitStore';
import { useSettingsStore } from './useSettingsStore';

const stores = [useSettingsStore, useHabitStore, useDietStore, useFinanceStore];

/** True once every persisted store has been rehydrated from AsyncStorage. */
export function useHydrated() {
  const [ready, setReady] = useState(() => stores.every((s) => s.persist.hasHydrated()));

  useEffect(() => {
    const check = () => {
      if (stores.every((s) => s.persist.hasHydrated())) setReady(true);
    };
    const unsubs = stores.map((s) => s.persist.onFinishHydration(check));
    check();
    return () => unsubs.forEach((u) => u());
  }, []);

  return ready;
}
