import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { lightColors, darkColors } from './colors';

/**
 * Material 3 theme objects for react-native-paper.
 * Extra brand tokens (income/expense/gold/card/border) are merged onto
 * theme.colors so components can read them directly from `theme.colors.x`.
 */

export const paperLightTheme = {
  ...MD3LightTheme,
  roundness: 16,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    secondary: lightColors.secondary,
    error: lightColors.error,
    background: lightColors.background,
    surface: lightColors.surface,
    surfaceVariant: lightColors.card,
    onSurface: lightColors.textPrimary,
    onSurfaceVariant: lightColors.textSecondary,
    outline: lightColors.border,
    // custom brand tokens
    card: lightColors.card,
    income: lightColors.income,
    expense: lightColors.expense,
    gold: lightColors.gold,
    accent: lightColors.accent,
    textPrimary: lightColors.textPrimary,
    textSecondary: lightColors.textSecondary,
    border: lightColors.border,
  },
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  roundness: 16,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    secondary: darkColors.secondary,
    error: darkColors.error,
    background: darkColors.background,
    surface: darkColors.surface,
    surfaceVariant: darkColors.card,
    onSurface: darkColors.textPrimary,
    onSurfaceVariant: darkColors.textSecondary,
    outline: darkColors.border,
    card: darkColors.card,
    income: darkColors.income,
    expense: darkColors.expense,
    gold: darkColors.gold,
    accent: darkColors.accent,
    textPrimary: darkColors.textPrimary,
    textSecondary: darkColors.textSecondary,
    border: darkColors.border,
  },
};

export const getTheme = isDark => (isDark ? paperDarkTheme : paperLightTheme);

export default { paperLightTheme, paperDarkTheme, getTheme };
