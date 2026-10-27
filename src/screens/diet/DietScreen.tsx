import React, { useEffect, useState } from 'react';
import { TextInput, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeIn,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Card, ProgressBar, ScalePressable, Screen } from '../../components/ui';
import { Meal, useDietStore } from '../../store/useDietStore';
import { accents, macroColors, radius, SCREEN_PAD, useTheme } from '../../theme';
import { addDays, fmtNum, longDayLabel, todayKey } from '../../utils/date';
import { GoalsSheet, MealFormSheet } from './MealFormSheet';

const accent = accents.diet;
const GAP = 12;

/* ------------------------------- Animated tile ---------------------------- */

function MealTile({
  meal,
  size,
  count,
  onAdd,
  onRemove,
  onEdit,
}: {
  meal: Meal;
  size: number;
  count: number;
  onAdd: () => void;
  onRemove: () => void;
  onEdit: () => void;
}) {
  const { colors } = useTheme();
  const done = count > 0;
  const p = useSharedValue(done ? 1 : 0);
  useEffect(() => {
    p.value = withTiming(done ? 1 : 0, { duration: 340 });
  }, [done, p]);

  const bg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], [colors.surface, accent]),
    borderColor: interpolateColor(p.value, [0, 1], [colors.border, accent]),
  }));
  const text = useAnimatedStyle(() => ({
    color: interpolateColor(p.value, [0, 1], [colors.text, '#FFFFFF']),
  }));
  const sub = useAnimatedStyle(() => ({
    color: interpolateColor(p.value, [0, 1], [colors.textMuted, 'rgba(255,255,255,0.8)']),
  }));
  const badge = useAnimatedStyle(() => ({
    transform: [{ scale: 0.92 + 0.08 * p.value }],
    opacity: p.value,
  }));
  const emoji = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.05 * p.value }],
  }));

  const macros = [
    meal.protein !== undefined && `P ${meal.protein}`,
    meal.carbs !== undefined && `C ${meal.carbs}`,
    meal.fat !== undefined && `G ${meal.fat}`,
  ].filter(Boolean);

  return (
    <ScalePressable
      haptic
      scaleTo={0.98}
      onPress={onAdd}
      onLongPress={onEdit}
      style={{ width: size, height: size }}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            borderRadius: radius.lg,
            borderWidth: 1,
            padding: 16,
            justifyContent: 'space-between',
          },
          bg,
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Animated.Text style={[{ fontSize: 38 }, emoji]}>{meal.emoji ?? '🍽️'}</Animated.Text>
          <Animated.View
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                height: 30,
                borderRadius: 15,
                backgroundColor: 'rgba(255,255,255,0.28)',
                paddingHorizontal: 4,
              },
              badge,
            ]}
            pointerEvents={done ? 'auto' : 'none'}
          >
            <ScalePressable haptic hitSlop={8} onPress={onRemove} style={{ padding: 3 }}>
              <Ionicons name="remove" size={18} color="#fff" />
            </ScalePressable>
            <AppText variant="heading" color="#fff" style={{ minWidth: 28, textAlign: 'center' }}>
              ×{count}
            </AppText>
          </Animated.View>
        </View>
        <View style={{ gap: 3 }}>
          <Animated.Text numberOfLines={2} style={[{ fontSize: 16, fontWeight: '700', letterSpacing: -0.3 }, text]}>
            {meal.name}
          </Animated.Text>
          {meal.calories !== undefined && (
            <Animated.Text style={[{ fontSize: 13, fontWeight: '700' }, text]}>
              {fmtNum(meal.calories)} kcal
            </Animated.Text>
          )}
          {macros.length > 0 && (
            <Animated.Text style={[{ fontSize: 11.5, fontWeight: '600' }, sub]}>
              {macros.join(' · ')}
            </Animated.Text>
          )}
        </View>
      </Animated.View>
    </ScalePressable>
  );
}

/* -------------------------------- Macro bar ------------------------------- */

function MacroRow({
  label,
  value,
  goal,
  unit,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
}) {
  const ratio = goal > 0 ? value / goal : 0;
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <AppText variant="caption" muted>{label}</AppText>
        <AppText variant="caption">
          <AppText variant="heading" color={color}>{fmtNum(value)}</AppText>
          {` / ${fmtNum(goal)} ${unit}`}
        </AppText>
      </View>
      <ProgressBar value={ratio} color={color} height={7} />
    </View>
  );
}

/* --------------------------------- Screen --------------------------------- */

export function DietScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { meals, logs, goals, addServing, removeServing } = useDietStore();
  const today = todayKey();
  const [date, setDate] = useState(today);
  const [sheet, setSheet] = useState<{ open: boolean; meal: Meal | null }>({ open: false, meal: null });
  const [goalsOpen, setGoalsOpen] = useState(false);

  const size = (width - SCREEN_PAD * 2 - GAP) / 2;
  const eaten = logs[date] ?? {};

  const [query, setQuery] = useState('');
  // Accent- and case-insensitive match so "pure" finds "Puré".
  const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const q = norm(query.trim());
  const visible = q ? meals.filter((m) => norm(m.name).includes(q)) : meals;

  // Dynamic totals: recomputed from the toggled meals on every change.
  const totals = meals.reduce(
    (t, m) => {
      const n = eaten[m.id] ?? 0;
      return {
        calories: t.calories + n * (m.calories ?? 0),
        protein: t.protein + n * (m.protein ?? 0),
        carbs: t.carbs + n * (m.carbs ?? 0),
        fat: t.fat + n * (m.fat ?? 0),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const calRatio = goals.calories > 0 ? totals.calories / goals.calories : 0;

  const chevron = { hitSlop: 10 } as const;

  return (
    <Screen title="Dieta" subtitle={longDayLabel(date)}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ScalePressable onPress={() => setDate(addDays(date, -1))} {...chevron}>
          <Ionicons name="chevron-back" size={22} color={colors.textMuted} />
        </ScalePressable>
        <AppText variant="heading">{date === today ? 'Hoy' : date}</AppText>
        <ScalePressable
          onPress={() => setDate(addDays(date, 1))}
          disabled={date >= today}
          style={{ opacity: date >= today ? 0.3 : 1 }}
          {...chevron}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
        </ScalePressable>
      </View>

      <Card index={0} style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <AppText variant="label" muted>Consumido</AppText>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <AppText variant="display">{fmtNum(totals.calories)}</AppText>
              <AppText variant="body" muted>/ {fmtNum(goals.calories)} kcal</AppText>
            </View>
          </View>
          <ScalePressable onPress={() => setGoalsOpen(true)} haptic hitSlop={8}>
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
              <Ionicons name="options" size={14} color={colors.text} />
              <AppText variant="caption">Objetivos</AppText>
            </View>
          </ScalePressable>
        </View>
        <ProgressBar value={calRatio} color={macroColors.calories} height={10} />
        <MacroRow label="Proteína" value={totals.protein} goal={goals.protein} unit="g" color={macroColors.protein} />
        <MacroRow label="Carbohidratos" value={totals.carbs} goal={goals.carbs} unit="g" color={macroColors.carbs} />
        <MacroRow label="Grasas" value={totals.fat} goal={goals.fat} unit="g" color={macroColors.fat} />
      </Card>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          paddingHorizontal: 14,
        }}
      >
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar plato..."
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
          returnKeyType="search"
          style={{ flex: 1, paddingVertical: 13, fontSize: 16, fontWeight: '600', color: colors.text }}
        />
        {query.length > 0 && (
          <ScalePressable onPress={() => setQuery('')} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </ScalePressable>
        )}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
        {visible.map((m) => (
          <Animated.View key={m.id} entering={FadeIn.duration(350)}>
            <MealTile
              meal={m}
              size={size}
              count={eaten[m.id] ?? 0}
              onAdd={() => addServing(m.id, date)}
              onRemove={() => removeServing(m.id, date)}
              onEdit={() => setSheet({ open: true, meal: m })}
            />
          </Animated.View>
        ))}
        {!q && (
          <ScalePressable
            haptic
            onPress={() => setSheet({ open: true, meal: null })}
            style={{
              width: size,
              height: size,
              borderRadius: radius.lg,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: accent,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Ionicons name="add-circle" size={36} color={accent} />
            <AppText variant="caption" color={accent}>Nuevo plato</AppText>
          </ScalePressable>
        )}
      </View>
      {q.length > 0 && visible.length === 0 && (
        <View style={{ gap: 12, alignItems: 'center', paddingVertical: 8 }}>
          <AppText variant="caption" muted>Ningún plato coincide con "{query.trim()}".</AppText>
          <Button
            label="Crear plato"
            icon="add"
            color={accent}
            variant="soft"
            onPress={() => setSheet({ open: true, meal: null })}
          />
        </View>
      )}
      <AppText variant="caption" muted style={{ textAlign: 'center' }}>
        Toca para añadir una ración (puedes repetir) · mantén pulsado para editar o eliminar.
      </AppText>

      <MealFormSheet
        visible={sheet.open}
        meal={sheet.meal}
        onClose={() => setSheet((s) => ({ ...s, open: false }))}
      />
      <GoalsSheet visible={goalsOpen} onClose={() => setGoalsOpen(false)} />
    </Screen>
  );
}
