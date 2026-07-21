import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function FilterChip({ label, selected, onPress, icon }) {
  const theme = useTheme();

  const backgroundColor = selected ? theme.colors.primary : 'transparent';
  const borderColor = selected ? theme.colors.primary : theme.colors.border;
  const textColor = selected ? '#FFFFFF' : theme.colors.textPrimary;
  const iconColor = selected ? '#FFFFFF' : theme.colors.textSecondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.chip,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      {icon ? (
        <Icon
          name={icon}
          size={14}
          color={iconColor}
          style={styles.icon}
        />
      ) : null}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
