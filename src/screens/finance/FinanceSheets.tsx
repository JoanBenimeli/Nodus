import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { AppText, Button, ColorPicker, Field, ScalePressable, Sheet } from '../../components/ui';
import { Category, useFinanceStore } from '../../store/useFinanceStore';
import { accents, radius, swatches, useTheme } from '../../theme';
import { parseNum, todayKey } from '../../utils/date';

const accent = accents.finance;

export function IncomeSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { income, setIncome } = useFinanceStore();
  const [value, setValue] = useState('');
  useEffect(() => {
    if (visible) setValue(String(income));
  }, [visible, income]);

  return (
    <Sheet visible={visible} onClose={onClose} title="Ingreso mensual base">
      <View style={{ flexDirection: 'row' }}>
        <Field label="Importe (€)" value={value} onChangeText={setValue} keyboardType="decimal-pad" />
      </View>
      <Button
        label="Guardar"
        color={accent}
        onPress={() => {
          setIncome(Math.max(0, parseNum(value) ?? 0));
          onClose();
        }}
      />
    </Sheet>
  );
}

export function CategorySheet({
  visible,
  category,
  onClose,
}: {
  visible: boolean;
  category: Category | null;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const { addCategory, updateCategory, removeCategory } = useFinanceStore();
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [color, setColor] = useState<string>(swatches[1]);

  useEffect(() => {
    if (!visible) return;
    setName(category?.name ?? '');
    setBudget(category ? String(category.budget) : '');
    setColor(category?.color ?? swatches[1]);
  }, [visible, category]);

  const save = () => {
    if (!name.trim()) return;
    const data = { name: name.trim(), budget: Math.max(0, parseNum(budget) ?? 0), color };
    if (category) updateCategory(category.id, data);
    else addCategory(data);
    onClose();
  };

  const remove = () =>
    Alert.alert('Eliminar categoría', 'Se eliminarán también sus gastos registrados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          if (category) removeCategory(category.id);
          onClose();
        },
      },
    ]);

  return (
    <Sheet visible={visible} onClose={onClose} title={category ? 'Editar categoría' : 'Nueva categoría'}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Field label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Suscripciones" />
        <View style={{ width: 120 }}>
          <Field label="Presupuesto" value={budget} onChangeText={setBudget} keyboardType="decimal-pad" placeholder="0" />
        </View>
      </View>
      <AppText variant="label" muted>Color</AppText>
      <ColorPicker colors={swatches} value={color} onChange={setColor} />
      <Button label="Guardar" color={accent} onPress={save} />
      {category && <Button label="Eliminar" icon="trash" variant="soft" color={colors.danger} onPress={remove} />}
    </Sheet>
  );
}

export function ExpenseSheet({
  visible,
  month,
  onClose,
}: {
  visible: boolean;
  month: string; // yyyy-mm, the month currently being viewed
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const { categories, addExpense } = useFinanceStore();
  const [catId, setCatId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!visible) return;
    setCatId(categories[0]?.id ?? '');
    setAmount('');
    setNote('');
  }, [visible, categories]);

  const save = () => {
    const n = parseNum(amount);
    if (!catId || !n || n <= 0) return;
    const today = todayKey();
    // Log on today's date when viewing the current month, else on the 1st of the viewed month.
    const date = today.startsWith(month) ? today : `${month}-01`;
    addExpense({ categoryId: catId, amount: n, note: note.trim(), date });
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Registrar gasto">
      {categories.length === 0 ? (
        <AppText variant="body" muted>Crea primero una categoría.</AppText>
      ) : (
        <>
          <AppText variant="label" muted>Categoría</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {categories.map((c) => {
              const on = c.id === catId;
              return (
                <ScalePressable
                  key={c.id}
                  haptic
                  onPress={() => setCatId(c.id)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    borderRadius: radius.md,
                    backgroundColor: on ? c.color : colors.surfaceAlt,
                  }}
                >
                  <AppText variant="caption" color={on ? '#fff' : colors.text}>{c.name}</AppText>
                </ScalePressable>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 130 }}>
              <Field label="Importe (€)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" />
            </View>
            <Field label="Nota" value={note} onChangeText={setNote} placeholder="Opcional" />
          </View>
          <Button label="Añadir gasto" color={accent} onPress={save} />
        </>
      )}
    </Sheet>
  );
}
