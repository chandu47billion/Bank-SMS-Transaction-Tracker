import React from 'react';
import { TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function Card({ children, style, onPress, elevation = 2 }) {
  const theme = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      ...shadowStyle(elevation),
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

function shadowStyle(elevation) {
  if (Platform.OS === 'android') {
    return { elevation };
  }
  const shadowOpacity = 0.04 + elevation * 0.03;
  const shadowRadius = elevation * 2;
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: elevation },
    shadowOpacity,
    shadowRadius,
  };
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
