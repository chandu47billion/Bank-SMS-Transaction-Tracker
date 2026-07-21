/**
 * Typography scale for MoneyFlow. Keeps font sizes/weights consistent
 * across screens without relying on the platform default Paper scale.
 */

export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  display: 36,
};

export const fontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
};

export const lineHeights = {
  tight: 18,
  normal: 22,
  relaxed: 28,
};

export const typography = {
  displayLarge: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.extraBold,
  },
  headline: {fontSize: fontSizes.xxl, fontWeight: fontWeights.bold},
  title: {fontSize: fontSizes.xl, fontWeight: fontWeights.bold},
  subtitle: {fontSize: fontSizes.lg, fontWeight: fontWeights.semiBold},
  body: {fontSize: fontSizes.base, fontWeight: fontWeights.regular},
  bodyMedium: {fontSize: fontSizes.base, fontWeight: fontWeights.medium},
  label: {fontSize: fontSizes.sm, fontWeight: fontWeights.medium},
  caption: {fontSize: fontSizes.xs, fontWeight: fontWeights.regular},
};

export default {fontSizes, fontWeights, lineHeights, typography};
