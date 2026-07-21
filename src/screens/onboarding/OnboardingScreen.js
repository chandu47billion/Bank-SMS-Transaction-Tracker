import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useApp} from '../../store/AppContext';
import {Button} from '../../components/common';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const PAGES = [
  {
    icon: 'message-text-outline',
    title: 'Automatic SMS Tracking',
    description:
      'MoneyFlow reads your bank SMS alerts and automatically logs every transaction — no manual entry needed.',
  },
  {
    icon: 'chart-donut',
    title: 'Smart Insights & Analytics',
    description:
      'See exactly where your money goes with beautiful category breakdowns, trends, and budgets.',
  },
  {
    icon: 'shield-check-outline',
    title: 'Private & Secure',
    description:
      'All your data stays on your device in a local encrypted database. Nothing is ever uploaded.',
  },
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const {completeOnboarding} = useApp();
  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleMomentumScrollEnd = event => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const goToPage = page => {
    scrollRef.current?.scrollTo({x: page * SCREEN_WIDTH, animated: true});
    setCurrentPage(page);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await completeOnboarding();
      navigation.replace('Permission');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentPage < PAGES.length - 1) {
      goToPage(currentPage + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    goToPage(PAGES.length - 1);
  };

  const isLastPage = currentPage === PAGES.length - 1;

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: theme.colors.background}]}>
      {/* Skip button */}
      <View style={styles.headerRow}>
        {!isLastPage ? (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text
              style={[styles.skipText, {color: theme.colors.textSecondary}]}>
              Skip
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipButton} />
        )}
      </View>

      {/* Paging scroll area */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        style={styles.scrollView}>
        {PAGES.map((page, index) => (
          <View key={index} style={styles.page}>
            <View
              style={[
                styles.iconCircle,
                {backgroundColor: `${theme.colors.primary}18`},
              ]}>
              <Icon name={page.icon} size={80} color={theme.colors.primary} />
            </View>
            <Text style={[styles.pageTitle, {color: theme.colors.textPrimary}]}>
              {page.title}
            </Text>
            <Text
              style={[
                styles.pageDescription,
                {color: theme.colors.textSecondary},
              ]}>
              {page.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom area: dots + action button */}
      <View style={styles.bottom}>
        <View style={styles.dotsRow}>
          {PAGES.map((_, index) => (
            <TouchableOpacity key={index} onPress={() => goToPage(index)}>
              <View
                style={[
                  styles.dot,
                  index === currentPage
                    ? [
                        styles.dotActive,
                        {backgroundColor: theme.colors.primary},
                      ]
                    : [
                        styles.dotInactive,
                        {backgroundColor: theme.colors.border},
                      ],
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={isLastPage ? 'Get Started' : 'Next'}
          onPress={handleNext}
          mode="contained"
          loading={loading}
          disabled={loading}
          fullWidth
          style={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    minHeight: 44,
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  pageDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  dot: {
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    height: 8,
  },
  dotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionButton: {
    borderRadius: 14,
  },
});
