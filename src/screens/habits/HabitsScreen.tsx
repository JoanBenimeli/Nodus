import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Card, ProgressBar, Screen, ScalePressable } from '../../components/ui';
import { Habit, useHabitStore } from '../../store/useHabitStore';
import { accents, radius, useTheme } from '../../theme';
import { addDays, longDayLabel, todayKey, WEEKDAY_SHORT, weekKeys, fromKey } from '../../utils/date';
import { activeOn, dayProgress } from '../../utils/habits';
import { HabitFormSheet } from './HabitFormSheet';

const accent = accents.habits;

/* ------------------------------ Big habit button -------------------------- */

function HabitButton({
  habit,
  done,
  disabled,
  onToggle,
  onEdit,
}: {
  habit: Habit;
  done: boolean;
  disabled: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const { colors } = useTheme();
  const p = useSharedValue(done ? 1 : 0);
  useEffect(() => {
    p.value = withTiming(done ? 1 : 0, { duration: 380 });
  }, [done, p]);

  const fill = useAnimatedStyle(() => ({ opacity: p.value }));
  const label = useAnimatedStyle(() => ({
    color: interpolateColor(p.value, [0, 1], [colors.text, '#FFFFFF']),
  }));
  const check = useAnimatedStyle(() => ({
    transform: [{ scale: 0.85 + 0.15 * p.value }],
    opacity: p.value,
  }));
  const ring = useAnimatedStyle(() => ({
    borderColor: interpolateColor(p.value, [0, 1], [colors.border, '#FFFFFF']),
    backgroundColor: interpolateColor(p.value, [0, 1], ['transparent', 'rgba(255,255,255,0.22)']),
  }));

  return (
    <ScalePressable
      haptic
      disabled={disabled}
      onPress={onToggle}
      onLongPress={onEdit}
      style={{
        height: 88,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        justifyContent: 'center',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <Animated.View
        style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: habit.color }, fill]}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 14 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: habit.color + '26',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={habit.icon} size={24} color={habit.color} />
        </View>
        <Animated.Text style={[{ flex: 1, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 }, label]}>
          {habit.name}
        </Animated.Text>
        <Animated.View
          style={[
            {
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 2.5,
              alignItems: 'center',
              justifyContent: 'center',
            },
            ring,
          ]}
        >
          <Animated.View style={check}>
            <Ionicons name="checkmark" size={26} color="#fff" />
          </Animated.View>
        </Animated.View>
      </View>
    </ScalePressable>
  );
}

/* --------------------------------- Screen --------------------------------- */

export function HabitsScreen() {
  const { colors } = useTheme();
  const { habits, logs, toggle } = useHabitStore();
  const today = todayKey();
  const [selected, setSelected] = useState(today);
  const [sheet, setSheet] = useState<{ open: boolean; habit: Habit | null }>({ open: false, habit: null });

  const week = weekKeys(selected);
  const weekStats = week
    .filter((k) => k <= today)
    .map((k) => dayProgress(habits, logs, k));
  const weekDone = weekStats.reduce((a, s) => a + s.done, 0);
  const weekTotal = weekStats.reduce((a, s) => a + s.total, 0);
  const weekRatio = weekTotal ? weekDone / weekTotal : 0;

  const list = activeOn(habits, selected);
  const day = dayProgress(habits, logs, selected);
  const future = selected > today;

  return (
    <Screen title="Hábitos" subtitle={longDayLabel(selected)}>
      {/* Weekly progress */}
      <Card index={0}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ScalePressable onPress={() => setSelected(addDays(selected, -7))} hitSlop={10}>
            <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
          </ScalePressable>
          <AppText variant="label" muted>
            Progreso semanal · {Math.round(weekRatio * 100)}%
          </AppText>
          <ScalePressable onPress={() => setSelected(addDays(selected, 7))} hitSlop={10}>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </ScalePressable>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
          {week.map((k, i) => {
            const stats = dayProgress(habits, logs, k);
            const isSel = k === selected;
            return (
              <ScalePressable
                key={k}
                haptic
                onPress={() => setSelected(k)}
                style={{
                  width: 42,
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderRadius: radius.md,
                  backgroundColor: isSel ? accent : 'transparent',
                  gap: 6,
                }}
              >
                <AppText variant="caption" color={isSel ? '#fff' : colors.textMuted}>
                  {WEEKDAY_SHORT[i]}
                </AppText>
                <AppText variant="heading" color={isSel ? '#fff' : k === today ? accent : colors.text}>
                  {fromKey(k).getDate()}
                </AppText>
                <View
                  style={{
                    width: 24,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: isSel ? 'rgba(255,255,255,0.35)' : colors.surfaceAlt,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${stats.ratio * 100}%`,
                      height: 4,
                      backgroundColor: isSel ? '#fff' : accent,
                    }}
                  />
                </View>
              </ScalePressable>
            );
          })}
        </View>
        <View style={{ marginTop: 16 }}>
          <ProgressBar value={weekRatio} color={accent} />
        </View>
      </Card>

      {/* Daily panel */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <AppText variant="heading">{selected === today ? 'Hoy' : 'Panel del día'}</AppText>
        <AppText variant="caption" muted>
          {day.done}/{day.total} completados
        </AppText>
      </View>

      {list.map((h) => (
        <HabitButton
          key={h.id}
          habit={h}
          done={!!logs[selected]?.includes(h.id)}
          disabled={future}
          onToggle={() => toggle(h.id, selected)}
          onEdit={() => setSheet({ open: true, habit: h })}
        />
      ))}

      {list.length === 0 && (
        <AppText variant="caption" muted style={{ textAlign: 'center', paddingVertical: 12 }}>
          No hay hábitos para este día.
        </AppText>
      )}

      <Button
        label="Nuevo hábito"
        icon="add"
        color={accent}
        variant="soft"
        onPress={() => setSheet({ open: true, habit: null })}
      />
      <AppText variant="caption" muted style={{ textAlign: 'center' }}>
        Mantén pulsado un hábito para editarlo.
      </AppText>

      <HabitFormSheet
        visible={sheet.open}
        habit={sheet.habit}
        onClose={() => setSheet((s) => ({ ...s, open: false }))}
      />
    </Screen>
  );
}
