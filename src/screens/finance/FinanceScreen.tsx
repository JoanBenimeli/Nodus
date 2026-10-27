import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  MonthNav,
  ProgressBar,
  ScalePressable,
  Screen,
} from '../../components/ui';
import { Category, useFinanceStore } from '../../store/useFinanceStore';
import { accents, useTheme } from '../../theme';
import { fmtMoney, monthLabel, monthOf, shiftMonth, todayKey } from '../../utils/date';
import { CategorySheet, ExpenseSheet, IncomeSheet } from './FinanceSheets';

const accent = accents.finance;

export function FinanceScreen() {
  const { colors } = useTheme();
  const { income, categories, expenses, removeExpense } = useFinanceStore();
  const today = todayKey();
  const [ym, setYm] = useState(monthOf(today));
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [catSheet, setCatSheet] = useState<{ open: boolean; cat: Category | null }>({ open: false, cat: null });

  // Derived values: everything below recomputes whenever the store changes.
  const monthExpenses = expenses.filter((e) => e.date.startsWith(ym));
  const spentBy = (id: string) => monthExpenses.filter((e) => e.categoryId === id).reduce((a, e) => a + e.amount, 0);
  const totalSpent = monthExpenses.reduce((a, e) => a + e.amount, 0);
  const totalBudget = categories.reduce((a, c) => a + c.budget, 0);
  const remaining = income - totalSpent;
  const unassigned = income - totalBudget;
  const spentRatio = income > 0 ? totalSpent / income : 0;

  const slices = categories
    .map((c) => ({ c, spent: spentBy(c.id) }))
    .filter((s) => s.spent > 0)
    .map((s) => ({ value: s.spent, color: s.c.color }));
  const pieData = slices.length ? slices : [{ value: 1, color: colors.surfaceAlt }];

  return (
    <Screen title="Finanzas" subtitle="Presupuesto mensual">
      <MonthNav
        label={monthLabel(ym)}
        onPrev={() => setYm(shiftMonth(ym, -1))}
        onNext={() => setYm(shiftMonth(ym, 1))}
        nextDisabled={ym >= monthOf(today)}
      />

      {/* Income + remaining margin */}
      <Card index={0} style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <AppText variant="label" muted>Margen restante</AppText>
            <AppText
              variant="display"
              color={remaining < 0 ? colors.danger : colors.text}
              style={{ marginTop: 4 }}
            >
              {fmtMoney(remaining)}
            </AppText>
          </View>
          <ScalePressable haptic onPress={() => setIncomeOpen(true)} hitSlop={8}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: colors.surfaceAlt,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Ionicons name="create-outline" size={14} color={colors.text} />
              <AppText variant="caption">{fmtMoney(income)}</AppText>
            </View>
          </ScalePressable>
        </View>
        <ProgressBar value={spentRatio} color={spentRatio > 1 ? colors.danger : accent} height={10} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="caption" muted>Gastado {fmtMoney(totalSpent)}</AppText>
          <AppText variant="caption" color={unassigned < 0 ? colors.danger : colors.textMuted}>
            {unassigned >= 0 ? `Sin asignar ${fmtMoney(unassigned)}` : `Sobreasignado ${fmtMoney(-unassigned)}`}
          </AppText>
        </View>
      </Card>

      {/* Donut */}
      <Card index={1} style={{ alignItems: 'center', gap: 18 }}>
        <View style={{ alignSelf: 'stretch' }}>
          <AppText variant="heading">Gasto por categoría</AppText>
        </View>
        <PieChart
          data={pieData}
          donut
          radius={96}
          innerRadius={66}
          innerCircleColor={colors.surface}
          strokeWidth={3}
          strokeColor={colors.surface}
          isAnimated
          animationDuration={700}
          centerLabelComponent={() => (
            <View style={{ alignItems: 'center' }}>
              <AppText variant="title">{Math.round(spentRatio * 100)}%</AppText>
              <AppText variant="caption" muted>del ingreso</AppText>
            </View>
          )}
        />
        {/* Legend: % of total spend per category */}
        <View style={{ alignSelf: 'stretch', gap: 8 }}>
          {categories.map((c) => {
            const share = totalSpent > 0 ? spentBy(c.id) / totalSpent : 0;
            return (
              <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.color }} />
                <AppText variant="caption" style={{ flex: 1 }}>{c.name}</AppText>
                <AppText variant="caption" muted>{Math.round(share * 100)}%</AppText>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Budgets */}
      <Card index={2} style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <AppText variant="heading">Presupuestos</AppText>
          <AppText variant="caption" muted>{fmtMoney(totalBudget)} asignados</AppText>
        </View>
        {categories.map((c) => {
          const spent = spentBy(c.id);
          const ratio = c.budget > 0 ? spent / c.budget : spent > 0 ? 1 : 0;
          const over = c.budget > 0 && spent > c.budget;
          return (
            <ScalePressable
              key={c.id}
              scaleTo={0.98}
              onPress={() => setCatSheet({ open: true, cat: c })}
              style={{ gap: 7 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText variant="body">{c.name}</AppText>
                <AppText variant="caption" color={over ? colors.danger : colors.textMuted}>
                  {fmtMoney(spent)} / {fmtMoney(c.budget)} · {Math.round(ratio * 100)}%
                </AppText>
              </View>
              <ProgressBar value={ratio} color={over ? colors.danger : c.color} />
            </ScalePressable>
          );
        })}
        {categories.length === 0 && <EmptyState text="Añade tu primera categoría de presupuesto." />}
        <Button
          label="Nueva categoría"
          icon="add"
          color={accent}
          variant="soft"
          onPress={() => setCatSheet({ open: true, cat: null })}
        />
      </Card>

      {/* Expenses */}
      <Card index={3} style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <AppText variant="heading">Gastos del mes</AppText>
          <ScalePressable haptic onPress={() => setExpenseOpen(true)} hitSlop={8}>
            <Ionicons name="add-circle" size={30} color={accent} />
          </ScalePressable>
        </View>
        {monthExpenses.slice(0, 12).map((e) => {
          const cat = categories.find((c) => c.id === e.categoryId);
          return (
            <Animated.View
              key={e.id}
              entering={FadeIn.duration(350)}
              exiting={FadeOut.duration(250)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cat?.color ?? colors.border }} />
              <View style={{ flex: 1 }}>
                <AppText variant="body">{e.note || cat?.name || 'Gasto'}</AppText>
                <AppText variant="caption" muted>{cat?.name} · {e.date.slice(8)}/{e.date.slice(5, 7)}</AppText>
              </View>
              <AppText variant="body">{fmtMoney(e.amount)}</AppText>
              <ScalePressable onPress={() => removeExpense(e.id)} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </ScalePressable>
            </Animated.View>
          );
        })}
        {monthExpenses.length === 0 && <EmptyState text="Sin gastos registrados este mes." />}
      </Card>

      <IncomeSheet visible={incomeOpen} onClose={() => setIncomeOpen(false)} />
      <ExpenseSheet visible={expenseOpen} month={ym} onClose={() => setExpenseOpen(false)} />
      <CategorySheet
        visible={catSheet.open}
        category={catSheet.cat}
        onClose={() => setCatSheet((s) => ({ ...s, open: false }))}
      />
    </Screen>
  );
}
