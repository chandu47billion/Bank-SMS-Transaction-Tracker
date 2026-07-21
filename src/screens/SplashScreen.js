import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {gradients} from '../theme/colors';

export default function SplashScreen() {
  // Navigation is driven entirely by AppNavigator via the isReady flag.
  // This component just renders the branded splash UI.
  useEffect(() => {
    return () => {};
  }, []);

  return (
    <LinearGradient colors={gradients.header} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.iconBadge}>
            <Icon name="cash-multiple" size={64} color="#1B4F72" />
          </View>

          <Text style={styles.appName}>MoneyFlow</Text>
          <Text style={styles.tagline}>Track every rupee, automatically</Text>
        </View>

        <View style={styles.loaderContainer}>
          <ActivityIndicator color="rgba(255,255,255,0.85)" size="small" />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.78)',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  loaderContainer: {
    paddingBottom: 40,
  },
});
