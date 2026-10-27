import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeTransition } from './src/components/ThemeTransition';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useHydrated } from './src/store/useHydrated';
import { palettes, useTheme } from './src/theme';

export default function App() {
  const ready = useHydrated();
  const { isDark, colors } = useTheme();

  // Hold the first frame until persisted state is loaded to avoid a flash of defaults.
  if (!ready) return <View style={{ flex: 1, backgroundColor: palettes.light.bg }} />;

  return (
    <SafeAreaProvider style={{ backgroundColor: colors.bg }}>
      <ThemeTransition>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <RootNavigator />
      </ThemeTransition>
    </SafeAreaProvider>
  );
}
