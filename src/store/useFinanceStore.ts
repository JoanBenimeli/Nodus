import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage, uid } from './storage';

export type Category = { id: string; name: string; budget: number; color: string };
export type Expense = {
  id: string;
  categoryId: string;
  amount: number;
  note: string;
  date: string; // yyyy-mm-dd
};

type FinanceState = {
  income: number;
  categories: Category[];
  expenses: Expense[];
  setIncome: (n: number) => void;
  addCategory: (c: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, c: Omit<Category, 'id'>) => void;
  removeCategory: (id: string) => void;
  addExpense: (e: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      income: 1800,
      categories: [
        { id: 'c1', name: 'Vivienda', budget: 700, color: '#3D8BFF' },
        { id: 'c2', name: 'Comida', budget: 350, color: '#19C39B' },
        { id: 'c3', name: 'Transporte', budget: 120, color: '#FFB020' },
        { id: 'c4', name: 'Ocio', budget: 150, color: '#FF6B9A' },
      ],
      expenses: [],
      setIncome: (income) => set({ income }),
      addCategory: (c) => set((s) => ({ categories: [...s.categories, { ...c, id: uid() }] })),
      updateCategory: (id, c) =>
        set((s) => ({ categories: s.categories.map((x) => (x.id === id ? { ...c, id } : x)) })),
      removeCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          expenses: s.expenses.filter((e) => e.categoryId !== id),
        })),
      addExpense: (e) => set((s) => ({ expenses: [{ ...e, id: uid() }, ...s.expenses] })),
      removeExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
    }),
    { name: 'nodus-finance', storage },
  ),
);
