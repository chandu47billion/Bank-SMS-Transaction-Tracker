/**
 * Root stack navigator: Splash -> Onboarding -> Permission -> Main app.
 * Also hosts full-screen routes reachable from within the bottom tabs
 * (TransactionDetail, Categories, Notifications, Banks, Search, Premium).
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useApp } from '../store/AppContext';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import PermissionScreen from '../screens/PermissionScreen';
import BottomTabNavigator from './BottomTabNavigator';
import TransactionDetailScreen from '../screens/transactions/TransactionDetailScreen';
import CategoriesScreen from '../screens/categories/CategoriesScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import BanksScreen from '../screens/banks/BanksScreen';
import SearchScreen from '../screens/search/SearchScreen';
import PremiumScreen from '../screens/premium/PremiumScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isReady, onboardingComplete, smsPermissionGranted } = useApp();

  if (!isReady) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  const initialRouteName = !onboardingComplete
    ? 'Onboarding'
    : !smsPermissionGranted
    ? 'Permission'
    : 'Main';

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Permission" component={PermissionScreen} />
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ presentation: 'card', animationEnabled: true }}
      />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Banks" component={BanksScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
    </Stack.Navigator>
  );
}
