import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton, useTheme } from 'react-native-paper';

export default function Button({
  title,
  onPress,
  mode = 'contained',
  icon,
  color,
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
}) {
  const theme = useTheme();

  const buttonColor = color || theme.colors.primary;

  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      icon={icon}
      loading={loading}
      disabled={disabled || loading}
      buttonColor={mode === 'contained' ? buttonColor : undefined}
      textColor={
        mode === 'contained'
          ? '#FFFFFF'
          : buttonColor
      }
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        style,
      ]}
      contentStyle={styles.content}
      labelStyle={styles.label}
    >
      {title}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    height: 48,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
