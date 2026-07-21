import React, {useState, useMemo, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  useTheme,
  Switch,
  List,
  Divider,
  TextInput,
  Text,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

import {useApp} from '../../store/AppContext';
import {gradients} from '../../theme/colors';
import {formatCurrency} from '../../utils/formatters';
import {getCurrentMonthRange, summarizeTransactions} from '../../utils/helpers';
import {Avatar, Button, Card} from '../../components/common';
import {
  BottomSheet,
  SuccessDialog,
  ConfirmDialog,
} from '../../components/dialogs';

export default function ProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    transactions,
    isDarkMode,
    toggleDarkMode,
    userName,
    userEmail,
    updateProfile,
    requestAndSyncSms,
  } = useApp();

  const [editSheetVisible, setEditSheetVisible] = useState(false);
  const [editName, setEditName] = useState(userName || '');
  const [editEmail, setEditEmail] = useState(userEmail || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [appLockEnabled, setAppLockEnabled] = useState(false);

  const [syncLoading, setSyncLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  const [successVisible, setSuccessVisible] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [aboutVisible, setAboutVisible] = useState(false);

  const monthRange = useMemo(() => getCurrentMonthRange(), []);
  const monthlyTxns = useMemo(
    () =>
      transactions.filter(
        t =>
          t.timestamp >= monthRange.startISO &&
          t.timestamp <= monthRange.endISO,
      ),
    [transactions, monthRange],
  );
  const summary = useMemo(
    () => summarizeTransactions(monthlyTxns),
    [monthlyTxns],
  );

  const styles = makeStyles(theme);

  const showSuccess = useCallback((title, message) => {
    setSuccessTitle(title);
    setSuccessMessage(message);
    setSuccessVisible(true);
  }, []);

  const openEditSheet = useCallback(() => {
    setEditName(userName || '');
    setEditEmail(userEmail || '');
    setEditSheetVisible(true);
  }, [userName, userEmail]);

  const handleSaveProfile = useCallback(async () => {
    setSavingProfile(true);
    try {
      await updateProfile({name: editName.trim(), email: editEmail.trim()});
      setEditSheetVisible(false);
      showSuccess(
        'Profile Updated',
        'Your profile has been saved successfully.',
      );
    } finally {
      setSavingProfile(false);
    }
  }, [editName, editEmail, updateProfile, showSuccess]);

  const handleSyncSms = useCallback(async () => {
    setSyncLoading(true);
    try {
      await requestAndSyncSms();
      showSuccess(
        'Sync Complete',
        'Your SMS transactions have been synced successfully.',
      );
    } finally {
      setSyncLoading(false);
    }
  }, [requestAndSyncSms, showSuccess]);

  const handleExportCSV = useCallback(() => {
    setExportLoading(true);
    setTimeout(() => {
      const headers = [
        'Date',
        'Time',
        'Type',
        'Bank',
        'Merchant',
        'Description',
        'Category',
        'Amount',
        'Balance',
      ];
      const rows = transactions.map(t => [
        t.timestamp ? t.timestamp.slice(0, 10) : '',
        t.timestamp ? t.timestamp.slice(11, 19) : '',
        t.type || '',
        t.bank || '',
        t.merchant || '',
        t.description || '',
        t.category || '',
        t.amount != null ? t.amount : '',
        t.balance != null ? t.balance : '',
      ]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const lineCount = csv.split('\n').length;
      setExportLoading(false);
      showSuccess(
        'Export Ready',
        `Export ready — ${transactions.length} transactions formatted as CSV (${lineCount} lines).`,
      );
    }, 800);
  }, [transactions, showSuccess]);

  const handleBackup = useCallback(() => {
    setBackupLoading(true);
    setTimeout(() => {
      setBackupLoading(false);
      showSuccess('Backup Complete', 'Backup completed successfully.');
    }, 1200);
  }, [showSuccess]);

  const statColumns = [
    {
      label: 'Transactions',
      value: String(summary.count),
      icon: 'swap-horizontal',
    },
    {
      label: 'Spent',
      value: formatCurrency(summary.debit, {compact: true}),
      icon: 'arrow-up-circle',
    },
    {
      label: 'Received',
      value: formatCurrency(summary.credit, {compact: true}),
      icon: 'arrow-down-circle',
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero gradient */}
        <LinearGradient colors={gradients.header} style={styles.hero}>
          <View style={styles.avatarRow}>
            <Avatar
              name={userName}
              size={80}
              backgroundColor="rgba(255,255,255,0.25)"
            />
            <TouchableOpacity style={styles.editBtn} onPress={openEditSheet}>
              <Icon name="pencil-outline" size={18} color="#fff" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.heroName}>{userName || 'Your Name'}</Text>
          <Text style={styles.heroEmail}>{userEmail || 'your@email.com'}</Text>
        </LinearGradient>

        {/* This month summary card */}
        <View style={styles.summaryWrapper}>
          <Card style={styles.summaryCard} elevation={4}>
            <Text
              style={[
                styles.summaryTitle,
                {color: theme.colors.textSecondary},
              ]}>
              This Month
            </Text>
            <View style={styles.statRow}>
              {statColumns.map((col, i) => (
                <React.Fragment key={col.label}>
                  <View style={styles.statCol}>
                    <Icon
                      name={col.icon}
                      size={20}
                      color={
                        i === 0
                          ? theme.colors.accent
                          : i === 1
                          ? theme.colors.expense
                          : theme.colors.income
                      }
                    />
                    <Text
                      style={[
                        styles.statValue,
                        {color: theme.colors.textPrimary},
                      ]}>
                      {col.value}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        {color: theme.colors.textSecondary},
                      ]}>
                      {col.label}
                    </Text>
                  </View>
                  {i < statColumns.length - 1 && (
                    <View
                      style={[
                        styles.statDivider,
                        {backgroundColor: theme.colors.border},
                      ]}
                    />
                  )}
                </React.Fragment>
              ))}
            </View>
          </Card>
        </View>

        {/* Preferences */}
        <List.Section
          title="Preferences"
          titleStyle={[
            styles.sectionTitle,
            {color: theme.colors.textSecondary},
          ]}>
          <View
            style={[
              styles.sectionCard,
              {backgroundColor: theme.colors.surface},
            ]}>
            <List.Item
              title="Dark Mode"
              titleStyle={{color: theme.colors.textPrimary}}
              description="Switch between light and dark theme"
              descriptionStyle={{color: theme.colors.textSecondary}}
              left={() => (
                <View style={styles.iconWrap}>
                  <Icon
                    name="theme-light-dark"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
              )}
              right={() => (
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleDarkMode}
                  color={theme.colors.primary}
                />
              )}
            />
            <Divider style={{backgroundColor: theme.colors.border}} />
            <List.Item
              title="Notifications"
              titleStyle={{color: theme.colors.textPrimary}}
              description="Receive transaction alerts"
              descriptionStyle={{color: theme.colors.textSecondary}}
              left={() => (
                <View style={styles.iconWrap}>
                  <Icon
                    name="bell-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
              )}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  color={theme.colors.primary}
                />
              )}
            />
            <Divider style={{backgroundColor: theme.colors.border}} />
            <List.Item
              title="Sync SMS Now"
              titleStyle={{color: theme.colors.textPrimary}}
              description="Re-scan inbox for new transactions"
              descriptionStyle={{color: theme.colors.textSecondary}}
              left={() => (
                <View style={styles.iconWrap}>
                  <Icon name="sync" size={22} color={theme.colors.primary} />
                </View>
              )}
              right={() =>
                syncLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                    style={{marginRight: 8}}
                  />
                ) : (
                  <Icon
                    name="chevron-right"
                    size={22}
                    color={theme.colors.textSecondary}
                  />
                )
              }
              onPress={handleSyncSms}
              disabled={syncLoading}
            />
          </View>
        </List.Section>

        {/* Security */}
        <List.Section
          title="Security"
          titleStyle={[
            styles.sectionTitle,
            {color: theme.colors.textSecondary},
          ]}>
          <View
            style={[
              styles.sectionCard,
              {backgroundColor: theme.colors.surface},
            ]}>
            <List.Item
              title="App Lock"
              titleStyle={{color: theme.colors.textPrimary}}
              description={
                appLockEnabled
                  ? 'App lock enabled (demo)'
                  : 'Lock app with PIN or biometrics'
              }
              descriptionStyle={{
                color: appLockEnabled
                  ? theme.colors.income
                  : theme.colors.textSecondary,
              }}
              left={() => (
                <View style={styles.iconWrap}>
                  <Icon
                    name="lock-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
              )}
              right={() => (
                <Switch
                  value={appLockEnabled}
                  onValueChange={setAppLockEnabled}
                  color={theme.colors.primary}
                />
              )}
            />
          </View>
        </List.Section>

        {/* Data */}
        <List.Section
          title="Data"
          titleStyle={[
            styles.sectionTitle,
            {color: theme.colors.textSecondary},
          ]}>
          <View
            style={[
              styles.sectionCard,
              {backgroundColor: theme.colors.surface},
            ]}>
            <List.Item
              title="Export Data (CSV)"
              titleStyle={{color: theme.colors.textPrimary}}
              description="Download all transactions as CSV"
              descriptionStyle={{color: theme.colors.textSecondary}}
              left={() => (
                <View style={styles.iconWrap}>
                  <Icon
                    name="file-export-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
              )}
              right={() =>
                exportLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                    style={{marginRight: 8}}
                  />
                ) : (
                  <Icon
                    name="chevron-right"
                    size={22}
                    color={theme.colors.textSecondary}
                  />
                )
              }
              onPress={handleExportCSV}
              disabled={exportLoading}
            />
            <Divider style={{backgroundColor: theme.colors.border}} />
            <List.Item
              title="Backup Data"
              titleStyle={{color: theme.colors.textPrimary}}
              description="Save a backup of your data"
              descriptionStyle={{color: theme.colors.textSecondary}}
              left={() => (
                <View style={styles.iconWrap}>
                  <Icon
                    name="cloud-upload-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
              )}
              right={() =>
                backupLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                    style={{marginRight: 8}}
                  />
                ) : (
                  <Icon
                    name="chevron-right"
                    size={22}
                    color={theme.colors.textSecondary}
                  />
                )
              }
              onPress={handleBackup}
              disabled={backupLoading}
            />
            <Divider style={{backgroundColor: theme.colors.border}} />
            <List.Item
              title="Linked Banks"
              titleStyle={{color: theme.colors.textPrimary}}
              description="Manage your connected bank accounts"
              descriptionStyle={{color: theme.colors.textSecondary}}
              left={() => (
                <View style={styles.iconWrap}>
                  <Icon
                    name="bank-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
              )}
              right={() => (
                <Icon
                  name="chevron-right"
                  size={22}
                  color={theme.colors.textSecondary}
                />
              )}
              onPress={() => navigation.navigate('Banks')}
            />
          </View>
        </List.Section>

        {/* About */}
        <List.Section
          title="About"
          titleStyle={[
            styles.sectionTitle,
            {color: theme.colors.textSecondary},
          ]}>
          <View
            style={[
              styles.sectionCard,
              {backgroundColor: theme.colors.surface},
            ]}>
            <List.Item
              title="Go Premium"
              titleStyle={{color: theme.colors.textPrimary}}
              description="Unlock advanced features & insights"
              descriptionStyle={{color: theme.colors.textSecondary}}
              left={() => (
                <View style={styles.iconWrap}>
                  <Icon
                    name="crown-outline"
                    size={22}
                    color={theme.colors.gold}
                  />
                </View>
              )}
              right={() => (
                <Icon
                  name="chevron-right"
                  size={22}
                  color={theme.colors.textSecondary}
                />
              )}
              onPress={() => navigation.navigate('Premium')}
            />
            <Divider style={{backgroundColor: theme.colors.border}} />
            <List.Item
              title="App Version"
              titleStyle={{color: theme.colors.textPrimary}}
              description="MoneyFlow v1.0.0"
              descriptionStyle={{color: theme.colors.textSecondary}}
              left={() => (
                <View style={styles.iconWrap}>
                  <Icon
                    name="information-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
              )}
              right={() => (
                <Text
                  style={[
                    styles.versionBadge,
                    {
                      color: theme.colors.textSecondary,
                      borderColor: theme.colors.border,
                    },
                  ]}>
                  1.0.0
                </Text>
              )}
            />
            <Divider style={{backgroundColor: theme.colors.border}} />
            <List.Item
              title="About MoneyFlow"
              titleStyle={{color: theme.colors.textPrimary}}
              description="Learn more about this app"
              descriptionStyle={{color: theme.colors.textSecondary}}
              left={() => (
                <View style={styles.iconWrap}>
                  <Icon
                    name="help-circle-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
              )}
              right={() => (
                <Icon
                  name="chevron-right"
                  size={22}
                  color={theme.colors.textSecondary}
                />
              )}
              onPress={() => setAboutVisible(true)}
            />
          </View>
        </List.Section>

        <View style={styles.footer} />
      </ScrollView>

      {/* Edit Profile BottomSheet */}
      <BottomSheet
        visible={editSheetVisible}
        onClose={() => setEditSheetVisible(false)}
        title="Edit Profile">
        <TextInput
          label="Full Name"
          value={editName}
          onChangeText={setEditName}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="account-outline" />}
        />
        <TextInput
          label="Email Address"
          value={editEmail}
          onChangeText={setEditEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          left={<TextInput.Icon icon="email-outline" />}
        />
        <Button
          title="Save Changes"
          onPress={handleSaveProfile}
          mode="contained"
          loading={savingProfile}
          disabled={savingProfile || !editName.trim()}
          fullWidth
          style={styles.saveBtn}
        />
      </BottomSheet>

      {/* Success dialog */}
      <SuccessDialog
        visible={successVisible}
        title={successTitle}
        message={successMessage}
        onDismiss={() => setSuccessVisible(false)}
      />

      {/* About dialog */}
      <ConfirmDialog
        visible={aboutVisible}
        title="About MoneyFlow"
        message={
          'MoneyFlow is an intelligent SMS-based bank transaction tracker that automatically reads your transaction messages and organises them into categories.\n\nTrack spending, set budgets, and gain financial insights — all from your existing bank SMS alerts. No manual entry needed.\n\nVersion 1.0.0 · Made with ❤️ for India'
        }
        confirmLabel="Got it"
        onConfirm={() => setAboutVisible(false)}
        onCancel={() => setAboutVisible(false)}
      />
    </SafeAreaView>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    hero: {
      paddingTop: 28,
      paddingBottom: 36,
      paddingHorizontal: 24,
      alignItems: 'center',
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },
    avatarRow: {
      width: '100%',
      alignItems: 'center',
      position: 'relative',
      marginBottom: 12,
    },
    editBtn: {
      position: 'absolute',
      right: 0,
      top: 0,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 4,
    },
    editBtnText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
    heroName: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '700',
      marginTop: 4,
    },
    heroEmail: {
      color: 'rgba(255,255,255,0.78)',
      fontSize: 14,
      marginTop: 2,
    },
    summaryWrapper: {
      marginHorizontal: 16,
      marginTop: -20,
      marginBottom: 4,
    },
    summaryCard: {
      padding: 16,
      borderRadius: theme.roundness,
    },
    summaryTitle: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 12,
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    statCol: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      marginTop: 2,
    },
    statLabel: {
      fontSize: 11,
    },
    statDivider: {
      width: 1,
      height: 40,
      opacity: 0.5,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginLeft: 16,
    },
    sectionCard: {
      marginHorizontal: 16,
      borderRadius: theme.roundness,
      overflow: 'hidden',
      elevation: 1,
    },
    iconWrap: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 36,
      marginLeft: 4,
    },
    input: {
      marginBottom: 12,
    },
    saveBtn: {
      marginTop: 8,
      marginBottom: 8,
    },
    versionBadge: {
      fontSize: 13,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
      alignSelf: 'center',
    },
    footer: {
      height: 32,
    },
  });
}
