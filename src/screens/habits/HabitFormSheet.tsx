import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, ColorPicker, Field, ScalePressable, Sheet, AppText } from '../../components/ui';
import { Habit, IconName, useHabitStore } from '../../store/useHabitStore';
import { accents, radius, swatches, useTheme } from '../../theme';

const ICONS: IconName[] = [
  'water', 'barbell', 'book', 'moon', 'walk', 'leaf',
  'bicycle', 'musical-notes', 'cafe', 'heart', 'flame', 'bulb',
];

export function HabitFormSheet({
  visible,
  habit,
  onClose,
}: {
  visible: boolean;
  habit: Habit | null;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const { addHabit, updateHabit, removeHabit } = useHabitStore();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<IconName>('water');
  const [color, setColor] = useState<string>(accents.habits);

  useEffect(() => {
    if (!visible) return;
    setName(habit?.name ?? '');
    setIcon(habit?.icon ?? 'water');
    setColor(habit?.color ?? accents.habits);
  }, [visible, habit]);

  const save = () => {
    if (!name.trim()) return;
    if (habit) updateHabit(habit.id, { name: name.trim(), icon, color });
    else addHabit({ name: name.trim(), icon, color });
    onClose();
  };

  const remove = () =>
    Alert.alert('Eliminar hábito', `¿Eliminar "${habit?.name}" y su historial?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          if (habit) removeHabit(habit.id);
          onClose();
        },
      },
    ]);

  return (
    <Sheet visible={visible} onClose={onClose} title={habit ? 'Editar hábito' : 'Nuevo hábito'}>
      <View style={{ flexDirection: 'row' }}>
        <Field label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Meditar 10 min" />
      </View>
      <AppText variant="label" muted>Icono</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {ICONS.map((i) => (
          <ScalePressable
            key={i}
            haptic
            onPress={() => setIcon(i)}
            style={{
              width: 48,
              height: 48,
              borderRadius: radius.md,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: icon === i ? color : colors.surfaceAlt,
            }}
          >
            <Ionicons name={i} size={22} color={icon === i ? '#fff' : colors.textMuted} />
          </ScalePressable>
        ))}
      </View>
      <AppText variant="label" muted>Color</AppText>
      <ColorPicker colors={swatches} value={color} onChange={setColor} />
      <Button label="Guardar" color={color} onPress={save} />
      {habit && <Button label="Eliminar" color={colors.danger} variant="soft" icon="trash" onPress={remove} />}
    </Sheet>
  );
}
