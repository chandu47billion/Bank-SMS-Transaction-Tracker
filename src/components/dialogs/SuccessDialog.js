import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Portal, Dialog, Button, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SuccessDialog({
  visible,
  title = 'Success',
  message,
  onDismiss,
}) {
  const theme = useTheme();

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={[styles.dialog, { backgroundColor: theme.colors.surface }]}
      >
        <Dialog.Content style={styles.content}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: theme.colors.income + '1A' },
            ]}
          >
            <Icon name="check-circle" size={56} color={theme.colors.income} />
          </View>

          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {title}
          </Text>

          {message ? (
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
              {message}
            </Text>
          ) : null}
        </Dialog.Content>

        <Dialog.Actions style={styles.actions}>
          <Button
            mode="contained"
            onPress={onDismiss}
            buttonColor={theme.colors.income}
            textColor="#FFFFFF"
            style={styles.doneButton}
            labelStyle={styles.doneLabel}
          >
            Done
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
  content: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  doneButton: {
    borderRadius: 12,
    flex: 1,
  },
  doneLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
