import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Field, Sheet, AppText } from '../../components/ui';
import { Meal, useDietStore } from '../../store/useDietStore';
import { accents, macroColors, useTheme } from '../../theme';
import { parseNum } from '../../utils/date';

const txt = (n?: number) => (n === undefined ? '' : String(n));

export function MealFormSheet({
  visible,
  meal,
  onClose,
}: {
  visible: boolean;
  meal: Meal | null;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const { addMeal, updateMeal, removeMeal } = useDietStore();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [cal, setCal] = useState('');
  const [pro, setPro] = useState('');
  const [carb, setCarb] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName(meal?.name ?? '');
    setEmoji(meal?.emoji ?? '');
    setCal(txt(meal?.calories));
    setPro(txt(meal?.protein));
    setCarb(txt(meal?.carbs));
    setFat(txt(meal?.fat));
  }, [visible, meal]);

  const save = () => {
    if (!name.trim()) return;
    // Macros are optional: empty / invalid input is stored as undefined.
    const data = {
      name: name.trim(),
      emoji: emoji.trim() || undefined,
      calories: parseNum(cal),
      protein: parseNum(pro),
      carbs: parseNum(carb),
      fat: parseNum(fat),
    };
    if (meal) updateMeal(meal.id, data);
    else addMeal(data);
    onClose();
  };

  const remove = () =>
    Alert.alert('Eliminar plato', `¿Eliminar "${meal?.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          if (meal) removeMeal(meal.id);
          onClose();
        },
      },
    ]);

  const num = { keyboardType: 'decimal-pad' as const };

  return (
    <Sheet visible={visible} onClose={onClose} title={meal ? 'Editar plato' : 'Nuevo plato'}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ width: 80 }}>
          <Field label="Emoji" value={emoji} onChangeText={setEmoji} placeholder="🍽️" maxLength={4} />
        </View>
        <Field label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Tortilla de claras" />
      </View>
      <AppText variant="caption" muted>
        Macronutrientes (opcional)
      </AppText>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Field label="Kcal" value={cal} onChangeText={setCal} placeholder="—" {...num} />
        <Field label="Prot (g)" value={pro} onChangeText={setPro} placeholder="—" {...num} />
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Field label="Carb (g)" value={carb} onChangeText={setCarb} placeholder="—" {...num} />
        <Field label="Grasa (g)" value={fat} onChangeText={setFat} placeholder="—" {...num} />
      </View>
      <Button label="Guardar" color={accents.diet} onPress={save} />
      {meal && <Button label="Eliminar" icon="trash" variant="soft" color={colors.danger} onPress={remove} />}
    </Sheet>
  );
}

export function GoalsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { goals, setGoals } = useDietStore();
  const [cal, setCal] = useState('');
  const [pro, setPro] = useState('');
  const [carb, setCarb] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    if (!visible) return;
    setCal(String(goals.calories));
    setPro(String(goals.protein));
    setCarb(String(goals.carbs));
    setFat(String(goals.fat));
  }, [visible, goals]);

  const save = () => {
    setGoals({
      calories: parseNum(cal) ?? goals.calories,
      protein: parseNum(pro) ?? goals.protein,
      carbs: parseNum(carb) ?? goals.carbs,
      fat: parseNum(fat) ?? goals.fat,
    });
    onClose();
  };

  const num = { keyboardType: 'decimal-pad' as const };
  return (
    <Sheet visible={visible} onClose={onClose} title="Objetivos diarios">
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Field label="Kcal" value={cal} onChangeText={setCal} {...num} />
        <Field label="Proteína (g)" value={pro} onChangeText={setPro} {...num} />
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Field label="Carbos (g)" value={carb} onChangeText={setCarb} {...num} />
        <Field label="Grasas (g)" value={fat} onChangeText={setFat} {...num} />
      </View>
      <Button label="Guardar objetivos" color={macroColors.protein} onPress={save} />
    </Sheet>
  );
}
