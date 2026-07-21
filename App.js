/**
 * MoneyFlow root component. Wires up gesture handler, safe area, the
 * global AppProvider (SQLite + settings state), the Paper theme
 * (light/dark, driven by AppContext) and React Navigation.
 */

import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme as NavigationLightTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';

import { AppProvider, useApp } from './src/store/AppContext';
import { getTheme } from './src/theme/theme';
import AppNavigator from './src/navigation/AppNavigator';

function ThemedApp() {
  const { isDarkMode } = useApp();
  const paperTheme = getTheme(isDarkMode);

  const navigationTheme = {
    ...(isDarkMode ? NavigationDarkTheme : NavigationLightTheme),
    colors: {
      ...(isDarkMode ? NavigationDarkTheme.colors : NavigationLightTheme.colors),
      primary: paperTheme.colors.primary,
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.textPrimary,
      border: paperTheme.colors.border,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={paperTheme.colors.background}
      />
      <NavigationContainer theme={navigationTheme}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <ThemedApp />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
