import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {Portal, Modal, IconButton, useTheme} from 'react-native-paper';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function BottomSheet({visible, onClose, title, children}) {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}>
        {/* Backdrop tap area — Modal's onDismiss handles it */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              transform: [{translateY}],
            },
          ]}>
          {/* Drag handle */}
          <View style={styles.handleRow}>
            <View
              style={[styles.handle, {backgroundColor: theme.colors.border}]}
            />
          </View>

          {/* Title row */}
          {title ? (
            <View style={styles.titleRow}>
              <Text
                style={[styles.titleText, {color: theme.colors.textPrimary}]}>
                {title}
              </Text>
              <IconButton
                icon="close"
                size={20}
                iconColor={theme.colors.textSecondary}
                onPress={onClose}
                style={styles.closeButton}
              />
            </View>
          ) : (
            <View style={styles.closeFallback}>
              <IconButton
                icon="close"
                size={20}
                iconColor={theme.colors.textSecondary}
                onPress={onClose}
              />
            </View>
          )}

          {/* Content */}
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Animated.View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
    padding: 0,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 24,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 4,
    paddingVertical: 8,
  },
  titleText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  closeButton: {
    margin: 0,
  },
  closeFallback: {
    alignItems: 'flex-end',
    paddingRight: 4,
  },
});
