/**
 * MoneyFlow premium fintech color palette.
 * Shared tokens used to build the Material 3 (Paper) light/dark themes.
 */

export const palette = {
  primary: '#1B4F72',
  primaryLight: '#2E86AB',
  secondary: '#27AE60',
  income: '#27AE60',
  expense: '#E74C3C',
  error: '#E74C3C',
  accent: '#2E86AB',
  gold: '#F39C12',

  backgroundLight: '#F8F9FA',
  backgroundDark: '#0D1117',

  surfaceLight: '#FFFFFF',
  surfaceDark: '#161B22',

  cardLight: '#FFFFFF',
  cardDark: '#1C2128',

  textPrimaryLight: '#1A1A2E',
  textPrimaryDark: '#E6EDF3',

  textSecondaryLight: '#6B7280',
  textSecondaryDark: '#9BA4B0',

  borderLight: '#E5E7EB',
  borderDark: '#30363D',

  white: '#FFFFFF',
  black: '#000000',
};

export const lightColors = {
  primary: palette.primary,
  secondary: palette.secondary,
  income: palette.income,
  expense: palette.expense,
  error: palette.error,
  accent: palette.accent,
  gold: palette.gold,
  background: palette.backgroundLight,
  surface: palette.surfaceLight,
  card: palette.cardLight,
  textPrimary: palette.textPrimaryLight,
  textSecondary: palette.textSecondaryLight,
  border: palette.borderLight,
  onPrimary: palette.white,
};

export const darkColors = {
  primary: palette.primaryLight,
  secondary: palette.secondary,
  income: palette.income,
  expense: palette.expense,
  error: palette.expense,
  accent: palette.accent,
  gold: palette.gold,
  background: palette.backgroundDark,
  surface: palette.surfaceDark,
  card: palette.cardDark,
  textPrimary: palette.textPrimaryDark,
  textSecondary: palette.textSecondaryDark,
  border: palette.borderDark,
  onPrimary: palette.white,
};

export const gradients = {
  header: ['#1B4F72', '#2E86AB'],
  income: ['#27AE60', '#1E8449'],
  expense: ['#E74C3C', '#C0392B'],
  premium: ['#F39C12', '#E67E22'],
};

export default {palette, lightColors, darkColors, gradients};
