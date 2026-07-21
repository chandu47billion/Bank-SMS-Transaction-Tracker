import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useTheme} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useApp} from '../store/AppContext';
import {Button} from '../components/common';

const BULLETS = [
  'Reads transaction SMS from your banks',
  'Categorizes spending automatically',
  'Never sends your data anywhere',
];

export default function PermissionScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const {requestAndSyncSms} = useApp();
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    setDenied(false);
    try {
      const granted = await requestAndSyncSms();
      if (granted) {
        navigation.replace('Main');
      } else {
        setDenied(true);
      }
    } catch {
      setDenied(true);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithout = () => {
    navigation.replace('Main');
  };

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: theme.colors.background}]}
      edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Icon badge */}
        <View
          style={[
            styles.iconCircle,
            {backgroundColor: `${theme.colors.primary}18`},
          ]}>
          <Icon
            name="message-alert-outline"
            size={72}
            color={theme.colors.primary}
          />
        </View>

        <Text style={[styles.title, {color: theme.colors.textPrimary}]}>
          Enable SMS Access
        </Text>

        <Text style={[styles.description, {color: theme.colors.textSecondary}]}>
          MoneyFlow scans your SMS inbox locally on your device to automatically
          detect bank transactions. No data ever leaves your phone.
        </Text>

        {/* Bullet list */}
        <View
          style={[
            styles.bulletCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          {BULLETS.map((item, index) => (
            <View key={index} style={styles.bulletRow}>
              <Icon
                name="check-circle"
                size={20}
                color={theme.colors.secondary}
                style={styles.bulletIcon}
              />
              <Text
                style={[styles.bulletText, {color: theme.colors.textPrimary}]}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Primary action */}
        <Button
          title="Allow SMS Access"
          onPress={handleAllow}
          mode="contained"
          icon="message-lock-outline"
          loading={loading}
          disabled={loading}
          fullWidth
          style={styles.primaryButton}
        />

        {/* Denied state */}
        {denied && (
          <View style={styles.deniedContainer}>
            <Icon
              name="alert-circle-outline"
              size={18}
              color={theme.colors.error}
              style={styles.deniedIcon}
            />
            <Text style={[styles.deniedText, {color: theme.colors.error}]}>
              Permission denied — you can still use the app, sample data will be
              shown
            </Text>
          </View>
        )}

        {denied && (
          <Button
            title="Continue without SMS access"
            onPress={handleContinueWithout}
            mode="outlined"
            fullWidth
            style={styles.secondaryButton}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  iconCircle: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 28,
    fontWeight: '400',
  },
  bulletCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletIcon: {
    marginRight: 12,
  },
  bulletText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    lineHeight: 21,
  },
  primaryButton: {
    borderRadius: 14,
    marginBottom: 16,
  },
  deniedContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  deniedIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  deniedText: {
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
    fontWeight: '500',
  },
  secondaryButton: {
    borderRadius: 14,
  },
});
