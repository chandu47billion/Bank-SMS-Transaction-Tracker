import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { gradients } from '../../theme/colors';
import { Button, Card } from '../../components/common';
import { SuccessDialog } from '../../components/dialogs';

const FEATURES = [
  {
    icon: 'bank-transfer',
    title: 'Unlimited SMS Bank Accounts',
    description:
      'Connect and monitor every bank account you own with no caps. Track all your debit cards, credit cards, and savings accounts in one place.',
  },
  {
    icon: 'chart-line',
    title: 'Advanced Analytics & Trends',
    description:
      'Deep-dive into multi-month spending trends, category breakdowns, and predictive insights to help you understand exactly where your money goes.',
  },
  {
    icon: 'bell-ring-outline',
    title: 'Custom Budget Alerts',
    description:
      'Set granular budget limits per category and receive real-time alerts the moment you are at risk of overshooting your monthly spending goals.',
  },
  {
    icon: 'file-chart-outline',
    title: 'CSV & PDF Export',
    description:
      'Export your complete transaction history as a formatted CSV or PDF report — perfect for tax filings, audits, or your personal finance spreadsheet.',
  },
  {
    icon: 'headset',
    title: 'Priority Support',
    description:
      'Skip the queue with dedicated priority email support and a guaranteed 24-hour response time from the MoneyFlow team.',
  },
  {
    icon: 'block-helper',
    title: 'Ad-Free Experience',
    description:
      'Enjoy a completely clean, distraction-free interface with zero advertisements, banners, or promotional interruptions of any kind.',
  },
];

const PRICING = {
  monthly: { label: '₹99/month', short: '₹99/mo' },
  annual: { label: '₹899/year (save 25%)', short: '₹899/yr' },
};

export default function PremiumScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = makeStyles(theme);

  const [billingCycle, setBillingCycle] = useState('monthly');
  const [successVisible, setSuccessVisible] = useState(false);

  const price = PRICING[billingCycle];

  const handleSubscribe = useCallback(() => {
    setSuccessVisible(true);
  }, []);

  const handleSuccessDismiss = useCallback(() => {
    setSuccessVisible(false);
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroWrapper}>
          <LinearGradient colors={gradients.premium} style={styles.hero}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Icon name="crown" size={64} color="#fff" style={styles.crownIcon} />
            <Text style={styles.heroTitle}>MoneyFlow Premium</Text>
            <Text style={styles.heroSubtitle}>
              Unlock powerful insights & unlimited tracking
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          {/* Billing toggle */}
          <View style={[styles.toggleRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {['monthly', 'annual'].map(cycle => {
              const active = billingCycle === cycle;
              return (
                <TouchableOpacity
                  key={cycle}
                  style={[
                    styles.togglePill,
                    active && { backgroundColor: theme.colors.gold },
                  ]}
                  onPress={() => setBillingCycle(cycle)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      { color: active ? '#fff' : theme.colors.textSecondary },
                    ]}
                  >
                    {cycle === 'monthly' ? 'Monthly' : 'Annual'}
                  </Text>
                  {cycle === 'annual' && (
                    <View style={styles.saveBadge}>
                      <Text style={styles.saveBadgeText}>SAVE 25%</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Price display */}
          <View style={styles.priceBlock}>
            <Text style={[styles.priceText, { color: theme.colors.gold }]}>{price.label}</Text>
            {billingCycle === 'annual' && (
              <Text style={[styles.priceSub, { color: theme.colors.textSecondary }]}>
                Billed annually · only ₹74.9/month
              </Text>
            )}
          </View>

          {/* Features card */}
          <Card style={styles.featuresCard} elevation={3}>
            <Text style={[styles.featuresHeader, { color: theme.colors.textPrimary }]}>
              Everything included
            </Text>
            {FEATURES.map((feature, index) => (
              <View key={feature.title}>
                <View style={styles.featureRow}>
                  <Icon
                    name="check-circle"
                    size={22}
                    color={theme.colors.income}
                    style={styles.featureIcon}
                  />
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: theme.colors.textPrimary }]}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
                {index < FEATURES.length - 1 && (
                  <View style={[styles.featureDivider, { backgroundColor: theme.colors.border }]} />
                )}
              </View>
            ))}
          </Card>

          {/* CTA */}
          <Button
            title={`Subscribe Now — ${price.short}`}
            onPress={handleSubscribe}
            mode="contained"
            color={theme.colors.gold}
            fullWidth
            style={styles.ctaBtn}
            icon="crown"
          />
          <Text style={[styles.footnote, { color: theme.colors.textSecondary }]}>
            Cancel anytime. This is a demo — no real payment will be processed.
          </Text>
        </View>
      </ScrollView>

      <SuccessDialog
        visible={successVisible}
        title="Welcome to Premium! 🎉"
        message="Your Premium subscription is now active (demo). Enjoy unlimited tracking and advanced analytics!"
        onDismiss={handleSuccessDismiss}
      />
    </SafeAreaView>
  );
}

function makeStyles(theme) {
  const goldColor = theme.colors.gold;
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    heroWrapper: {
      overflow: 'hidden',
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },
    hero: {
      paddingTop: 16,
      paddingBottom: 40,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    backBtn: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.25)',
      borderRadius: 20,
      padding: 8,
      marginBottom: 16,
    },
    crownIcon: {
      marginBottom: 12,
    },
    heroTitle: {
      color: '#fff',
      fontSize: 26,
      fontWeight: '800',
      textAlign: 'center',
      letterSpacing: 0.3,
    },
    heroSubtitle: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 6,
      lineHeight: 20,
      paddingHorizontal: 16,
    },
    content: {
      padding: 16,
      paddingTop: 20,
    },
    toggleRow: {
      flexDirection: 'row',
      borderRadius: 32,
      borderWidth: 1,
      overflow: 'hidden',
      padding: 4,
    },
    togglePill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 28,
      gap: 6,
    },
    toggleText: {
      fontSize: 14,
      fontWeight: '700',
    },
    saveBadge: {
      backgroundColor: '#fff',
      borderRadius: 8,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    saveBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: goldColor,
    },
    priceBlock: {
      alignItems: 'center',
      marginVertical: 20,
    },
    priceText: {
      fontSize: 32,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    priceSub: {
      fontSize: 13,
      marginTop: 4,
    },
    featuresCard: {
      padding: 16,
      borderRadius: theme.roundness,
      marginBottom: 24,
    },
    featuresHeader: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 16,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 10,
    },
    featureIcon: {
      marginRight: 12,
      marginTop: 1,
    },
    featureText: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 3,
    },
    featureDesc: {
      fontSize: 13,
      lineHeight: 18,
    },
    featureDivider: {
      height: 1,
      opacity: 0.5,
    },
    ctaBtn: {
      borderRadius: theme.roundness,
      marginBottom: 12,
    },
    footnote: {
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 24,
      paddingHorizontal: 8,
    },
  });
}
