import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/habits/DashboardScreen';
import { HabitsScreen } from '../screens/habits/HabitsScreen';
import { DietScreen } from '../screens/diet/DietScreen';
import { FinanceScreen } from '../screens/finance/FinanceScreen';
import { accents, useTheme } from '../theme';

type TabParams = { Habits: undefined; Dashboard: undefined; Diet: undefined; Finance: undefined };
const Tab = createBottomTabNavigator<TabParams>();

type IconName = keyof typeof Ionicons.glyphMap;
const tabs: {
  name: keyof TabParams;
  title: string;
  icon: [IconName, IconName];
  accent: string;
  component: React.ComponentType;
}[] = [
  { name: 'Habits', title: 'Hábitos', icon: ['checkmark-circle', 'checkmark-circle-outline'], accent: accents.habits, component: HabitsScreen },
  { name: 'Dashboard', title: 'Dashboard', icon: ['stats-chart', 'stats-chart-outline'], accent: accents.habits, component: DashboardScreen },
  { name: 'Diet', title: 'Dieta', icon: ['nutrition', 'nutrition-outline'], accent: accents.diet, component: DietScreen },
  { name: 'Finance', title: 'Finanzas', icon: ['wallet', 'wallet-outline'], accent: accents.finance, component: FinanceScreen },
];

export function RootNavigator() {
  const { colors, isDark } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: accents.habits,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        }}
      >
        {tabs.map((t) => (
          <Tab.Screen
            key={t.name}
            name={t.name}
            component={t.component}
            options={{
              title: t.title,
              tabBarActiveTintColor: t.accent,
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons name={focused ? t.icon[0] : t.icon[1]} size={size} color={color} />
              ),
            }}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
