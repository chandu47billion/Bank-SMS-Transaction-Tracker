/**
 * Global app state via React Context (no Redux). Holds the transaction
 * list, theme mode, loading/permission flags and exposes actions that
 * wrap the SQLite + SMS layers.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { initDatabase } from '../database/db';
import {
  getAllTransactions,
  insertTransactionsBulk,
  updateTransactionCategory as dbUpdateCategory,
  deleteTransaction as dbDeleteTransaction,
} from '../database/transactions';
import { getBudgetsForMonth, setBudget as dbSetBudget } from '../database/budgets';
import {
  getBoolSetting,
  setBoolSetting,
  getSetting,
  setSetting,
  SETTINGS_KEYS,
} from '../database/settings';
import { requestSmsPermission, checkSmsPermission, readAndParseInboxSms } from '../sms/bridge';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [smsPermissionGranted, setSmsPermissionGranted] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [userName, setUserName] = useState('Arjun Mehta');
  const [userEmail, setUserEmail] = useState('arjun.mehta@example.com');
  const [refreshing, setRefreshing] = useState(false);

  const bootstrap = useCallback(async () => {
    await initDatabase();
    const [txns, storedDark, storedOnboarding, storedSmsPerm, storedName, storedEmail, monthBudgets] =
      await Promise.all([
        getAllTransactions(),
        getBoolSetting(SETTINGS_KEYS.DARK_MODE, Appearance.getColorScheme() === 'dark'),
        getBoolSetting(SETTINGS_KEYS.ONBOARDING_COMPLETE, false),
        getBoolSetting(SETTINGS_KEYS.SMS_PERMISSION_GRANTED, false),
        getSetting(SETTINGS_KEYS.USER_NAME, 'Arjun Mehta'),
        getSetting(SETTINGS_KEYS.USER_EMAIL, 'arjun.mehta@example.com'),
        getBudgetsForMonth(),
      ]);
    setTransactions(txns);
    setIsDarkMode(storedDark);
    setOnboardingComplete(storedOnboarding);
    setSmsPermissionGranted(storedSmsPerm);
    setUserName(storedName);
    setUserEmail(storedEmail);
    setBudgets(monthBudgets);
    setIsReady(true);
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const refreshTransactions = useCallback(async () => {
    setRefreshing(true);
    try {
      const txns = await getAllTransactions();
      setTransactions(txns);
      const monthBudgets = await getBudgetsForMonth();
      setBudgets(monthBudgets);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const toggleDarkMode = useCallback(async () => {
    setIsDarkMode(prev => {
      const next = !prev;
      setBoolSetting(SETTINGS_KEYS.DARK_MODE, next);
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(async () => {
    await setBoolSetting(SETTINGS_KEYS.ONBOARDING_COMPLETE, true);
    setOnboardingComplete(true);
  }, []);

  const requestAndSyncSms = useCallback(async () => {
    const granted = await requestSmsPermission();
    setSmsPermissionGranted(granted);
    await setBoolSetting(SETTINGS_KEYS.SMS_PERMISSION_GRANTED, granted);
    if (granted) {
      const parsedTxns = await readAndParseInboxSms();
      if (parsedTxns.length > 0) {
        await insertTransactionsBulk(parsedTxns);
        await setSetting(SETTINGS_KEYS.LAST_SMS_SYNC, new Date().toISOString());
        await refreshTransactions();
      }
    }
    return granted;
  }, [refreshTransactions]);

  const checkPermission = useCallback(async () => {
    const granted = await checkSmsPermission();
    setSmsPermissionGranted(granted);
    return granted;
  }, []);

  const updateTransactionCategory = useCallback(
    async (id, categoryId) => {
      await dbUpdateCategory(id, categoryId);
      await refreshTransactions();
    },
    [refreshTransactions],
  );

  const removeTransaction = useCallback(
    async id => {
      await dbDeleteTransaction(id);
      await refreshTransactions();
    },
    [refreshTransactions],
  );

  const updateBudget = useCallback(async (categoryId, limitAmount) => {
    await dbSetBudget(categoryId, limitAmount);
    const monthBudgets = await getBudgetsForMonth();
    setBudgets(monthBudgets);
  }, []);

  const updateProfile = useCallback(async ({ name, email }) => {
    if (name != null) {
      await setSetting(SETTINGS_KEYS.USER_NAME, name);
      setUserName(name);
    }
    if (email != null) {
      await setSetting(SETTINGS_KEYS.USER_EMAIL, email);
      setUserEmail(email);
    }
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      transactions,
      budgets,
      isDarkMode,
      smsPermissionGranted,
      onboardingComplete,
      userName,
      userEmail,
      refreshing,
      refreshTransactions,
      toggleDarkMode,
      completeOnboarding,
      requestAndSyncSms,
      checkPermission,
      updateTransactionCategory,
      removeTransaction,
      updateBudget,
      updateProfile,
    }),
    [
      isReady,
      transactions,
      budgets,
      isDarkMode,
      smsPermissionGranted,
      onboardingComplete,
      userName,
      userEmail,
      refreshing,
      refreshTransactions,
      toggleDarkMode,
      completeOnboarding,
      requestAndSyncSms,
      checkPermission,
      updateTransactionCategory,
      removeTransaction,
      updateBudget,
      updateProfile,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}

export default AppContext;
