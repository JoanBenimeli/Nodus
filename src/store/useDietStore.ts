import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage, uid } from './storage';

export type Meal = {
  id: string;
  name: string;
  emoji?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

export type MacroGoals = { calories: number; protein: number; carbs: number; fat: number };

type DietState = {
  meals: Meal[];
  logs: Record<string, Record<string, number>>; // dateKey -> mealId -> servings eaten
  goals: MacroGoals;
  addMeal: (m: Omit<Meal, 'id'>) => void;
  updateMeal: (id: string, m: Omit<Meal, 'id'>) => void;
  removeMeal: (id: string) => void;
  addServing: (id: string, dateKey: string) => void;
  removeServing: (id: string, dateKey: string) => void;
  setGoals: (g: MacroGoals) => void;
};

export const useDietStore = create<DietState>()(
  persist(
    (set) => ({
      meals: [
        { id: 'm1', name: 'Avena y claras', emoji: '🥣', calories: 520, protein: 38, carbs: 62, fat: 12 },
        { id: 'm2', name: 'Pollo con arroz', emoji: '🍗', calories: 680, protein: 55, carbs: 70, fat: 14 },
        { id: 'm3', name: 'Batido de proteína', emoji: '🥤', calories: 220, protein: 40, carbs: 8, fat: 3 },
        { id: 'm4', name: 'Salmón y verduras', emoji: '🐟', calories: 610, protein: 42, carbs: 25, fat: 33 },
      ],
      logs: {},
      goals: { calories: 2400, protein: 160, carbs: 250, fat: 70 },
      addMeal: (m) => set((s) => ({ meals: [...s.meals, { ...m, id: uid() }] })),
      updateMeal: (id, m) =>
        set((s) => ({ meals: s.meals.map((x) => (x.id === id ? { ...m, id } : x)) })),
      removeMeal: (id) =>
        set((s) => ({
          meals: s.meals.filter((m) => m.id !== id),
          logs: Object.fromEntries(
            Object.entries(s.logs).map(([k, day]) => [
              k,
              Object.fromEntries(Object.entries(day).filter(([mealId]) => mealId !== id)),
            ]),
          ),
        })),
      addServing: (id, dateKey) =>
        set((s) => {
          const day = s.logs[dateKey] ?? {};
          return { logs: { ...s.logs, [dateKey]: { ...day, [id]: (day[id] ?? 0) + 1 } } };
        }),
      removeServing: (id, dateKey) =>
        set((s) => {
          const { [id]: count = 0, ...rest } = s.logs[dateKey] ?? {};
          const day = count > 1 ? { ...rest, [id]: count - 1 } : rest;
          return { logs: { ...s.logs, [dateKey]: day } };
        }),
      setGoals: (goals) => set({ goals }),
    }),
    {
      name: 'nodus-diet',
      storage,
      version: 1,
      // v0 stored consumed meal ids as string[]; v1 stores servings per meal.
      migrate: (persisted, version) => {
        const state = persisted as { logs?: Record<string, string[]> };
        if (version < 1 && state?.logs) {
          state.logs = Object.fromEntries(
            Object.entries(state.logs).map(([k, ids]) => [
              k,
              Object.fromEntries(ids.map((id) => [id, 1])),
            ]),
          ) as never;
        }
        return state as unknown as DietState;
      },
    },
  ),
);
