import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from './Button';

export default function EmptyState({
  icon = 'inbox-outline',
  title,
  message,
  actionLabel,
  onAction,
}) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          {backgroundColor: theme.colors.surfaceVariant},
        ]}>
        <Icon name={icon} size={48} color={theme.colors.textSecondary} />
      </View>

      {title ? (
        <Text style={[styles.title, {color: theme.colors.textPrimary}]}>
          {title}
        </Text>
      ) : null}

      {message ? (
        <Text style={[styles.message, {color: theme.colors.textSecondary}]}>
          {message}
        </Text>
      ) : null}

      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          mode="contained"
          style={styles.actionButton}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  actionButton: {
    minWidth: 140,
  },
});
