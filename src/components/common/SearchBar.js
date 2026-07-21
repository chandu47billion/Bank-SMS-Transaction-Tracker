import React from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar as PaperSearchbar, useTheme } from 'react-native-paper';

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search transactions...',
  onSubmit,
  autoFocus = false,
}) {
  const theme = useTheme();

  return (
    <PaperSearchbar
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      onSubmitEditing={onSubmit}
      autoFocus={autoFocus}
      style={[
        styles.searchbar,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      inputStyle={[styles.input, { color: theme.colors.textPrimary }]}
      iconColor={theme.colors.textSecondary}
      placeholderTextColor={theme.colors.textSecondary}
      elevation={0}
    />
  );
}

const styles = StyleSheet.create({
  searchbar: {
    borderRadius: 12,
    borderWidth: 1,
    elevation: 0,
  },
  input: {
    fontSize: 15,
  },
});
