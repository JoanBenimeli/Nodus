import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toKey } from '../utils/date';
import { storage, uid } from './storage';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type Habit = {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  createdAt: string; // yyyy-mm-dd; habit only counts from this day on
};

type HabitState = {
  habits: Habit[];
  logs: Record<string, string[]>; // dateKey -> completed habit ids
  addHabit: (h: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (id: string, patch: Partial<Omit<Habit, 'id'>>) => void;
  removeHabit: (id: string) => void;
  toggle: (id: string, dateKey: string) => void;
};

const today = () => toKey(new Date());

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: [
        { id: 'h1', name: 'Beber 2L de agua', icon: 'water', color: '#3D8BFF', createdAt: '2000-01-01' },
        { id: 'h2', name: 'Entrenar', icon: 'barbell', color: '#7C5CFF', createdAt: '2000-01-01' },
        { id: 'h3', name: 'Leer 20 min', icon: 'book', color: '#FFB020', createdAt: '2000-01-01' },
      ],
      logs: {},
      addHabit: (h) =>
        set((s) => ({ habits: [...s.habits, { ...h, id: uid(), createdAt: today() }] })),
      updateHabit: (id, patch) =>
        set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)) })),
      removeHabit: (id) =>
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
          logs: Object.fromEntries(
            Object.entries(s.logs).map(([k, ids]) => [k, ids.filter((i) => i !== id)]),
          ),
        })),
      toggle: (id, dateKey) =>
        set((s) => {
          const current = s.logs[dateKey] ?? [];
          const next = current.includes(id) ? current.filter((i) => i !== id) : [...current, id];
          return { logs: { ...s.logs, [dateKey]: next } };
        }),
    }),
    { name: 'nodus-habits', storage },
  ),
);
