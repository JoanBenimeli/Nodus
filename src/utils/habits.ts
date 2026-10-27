import type { Habit } from '../store/useHabitStore';

export const activeOn = (habits: Habit[], key: string) => habits.filter((h) => h.createdAt <= key);

export function dayProgress(habits: Habit[], logs: Record<string, string[]>, key: string) {
  const active = activeOn(habits, key);
  const done = active.filter((h) => logs[key]?.includes(h.id)).length;
  return { done, total: active.length, ratio: active.length ? done / active.length : 0 };
}
