import React, { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { AppText, Card, EmptyState, MonthNav, ProgressBar, Screen } from '../../components/ui';
import { useHabitStore } from '../../store/useHabitStore';
import { accents, SCREEN_PAD, useTheme } from '../../theme';
import { monthDays, monthLabel, monthOf, shiftMonth, todayKey } from '../../utils/date';
import { dayProgress } from '../../utils/habits';

const accent = accents.habits;

function Stat({ label, value, index }: { label: string; value: string; index: number }) {
  return (
    <Card index={index} style={{ flex: 1, padding: 14 }}>
      <AppText variant="label" muted>{label}</AppText>
      <AppText variant="title" style={{ marginTop: 6 }}>{value}</AppText>
    </Card>
  );
}

export function DashboardScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { habits, logs } = useHabitStore();
  const today = todayKey();
  const [ym, setYm] = useState(monthOf(today));

  // Only days that already happened and had at least one active habit.
  const days = monthDays(ym).filter((k) => k <= today);
  const stats = days.map((k) => ({ k, ...dayProgress(habits, logs, k) })).filter((d) => d.total > 0);

  const avg = stats.length ? stats.reduce((a, d) => a + d.ratio, 0) / stats.length : 0;
  const perfect = stats.filter((d) => d.ratio === 1).length;
  const completions = stats.reduce((a, d) => a + d.done, 0);
  let best = 0;
  let run = 0;
  for (const d of stats) {
    run = d.ratio === 1 ? run + 1 : 0;
    best = Math.max(best, run);
  }

  const chartData = stats.map((d, i) => ({
    value: Math.round(d.ratio * 100),
    label: i % 5 === 0 ? String(Number(d.k.slice(8))) : '',
  }));
  const chartWidth = width - SCREEN_PAD * 2 - 36 - 36;

  const rates = habits.map((h) => {
    const applicable = stats.filter((d) => h.createdAt <= d.k);
    const hit = applicable.filter((d) => logs[d.k]?.includes(h.id)).length;
    return { habit: h, ratio: applicable.length ? hit / applicable.length : 0 };
  });

  return (
    <Screen title="Dashboard" subtitle="Progreso mensual">
      <MonthNav
        label={monthLabel(ym)}
        onPrev={() => setYm(shiftMonth(ym, -1))}
        onNext={() => setYm(shiftMonth(ym, 1))}
        nextDisabled={ym >= monthOf(today)}
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Stat index={0} label="Media" value={`${Math.round(avg * 100)}%`} />
        <Stat index={1} label="Días 100%" value={String(perfect)} />
        <Stat index={2} label="Racha" value={`${best}d`} />
      </View>

      <Card index={3}>
        <AppText variant="heading">Cumplimiento diario</AppText>
        <AppText variant="caption" muted style={{ marginBottom: 14 }}>
          {completions} hábitos completados este mes
        </AppText>
        {chartData.length > 1 ? (
          <LineChart
            data={chartData}
            width={chartWidth}
            height={180}
            adjustToWidth
            initialSpacing={8}
            endSpacing={8}
            areaChart
            curved
            hideDataPoints
            color={accent}
            thickness={3}
            startFillColor={accent}
            endFillColor={accent}
            startOpacity={0.35}
            endOpacity={0.02}
            maxValue={100}
            noOfSections={4}
            yAxisLabelSuffix="%"
            yAxisLabelWidth={36}
            yAxisThickness={0}
            xAxisThickness={0}
            rulesColor={colors.border}
            rulesType="dashed"
            yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
            isAnimated
            animationDuration={900}
            backgroundColor="transparent"
          />
        ) : (
          <EmptyState text="Aún no hay suficientes datos este mes." />
        )}
      </Card>

      <Card index={4} style={{ gap: 14 }}>
        <AppText variant="heading">Por hábito</AppText>
        {rates.map(({ habit, ratio }) => (
          <View key={habit.id} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="body">{habit.name}</AppText>
              <AppText variant="body" color={habit.color}>
                {Math.round(ratio * 100)}%
              </AppText>
            </View>
            <ProgressBar value={ratio} color={habit.color} />
          </View>
        ))}
        {rates.length === 0 && <EmptyState text="Crea tu primer hábito en la pestaña Hábitos." />}
      </Card>
    </Screen>
  );
}
