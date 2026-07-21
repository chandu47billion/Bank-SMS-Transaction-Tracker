import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Portal, Dialog, Button, useTheme } from 'react-native-paper';

export default function ConfirmDialog({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
}) {
  const theme = useTheme();
  const confirmColor = destructive ? theme.colors.error : theme.colors.primary;

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onCancel}
        style={[styles.dialog, { backgroundColor: theme.colors.surface }]}
      >
        <Dialog.Title style={[styles.title, { color: theme.colors.textPrimary }]}>
          {title}
        </Dialog.Title>
        <Dialog.Content>
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            {message}
          </Text>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          <Button
            textColor={theme.colors.textSecondary}
            onPress={onCancel}
            labelStyle={styles.actionLabel}
          >
            {cancelLabel}
          </Button>
          <Button
            textColor={confirmColor}
            onPress={onConfirm}
            labelStyle={[styles.actionLabel, { fontWeight: '700' }]}
          >
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 20,
    marginHorizontal: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
