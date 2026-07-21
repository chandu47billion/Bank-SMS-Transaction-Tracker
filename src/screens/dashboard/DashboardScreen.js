import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

import {useApp} from '../../store/AppContext';
import {formatCurrency} from '../../utils/formatters';
import {
  getCurrentMonthRange,
  getTodayRange,
  summarizeTransactions,
  groupByCategory,
} from '../../utils/helpers';
import {gradients} from '../../theme/colors';
import {
  Card,
  TransactionItem,
  EmptyState,
  Avatar,
} from '../../components/common';
import {SpendingPieChart, IncomeExpenseChart} from '../../components/charts';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

function getFirstName(fullName) {
  if (!fullName) {
    return 'there';
  }
  return fullName.trim().split(' ')[0];
}

function daysElapsedInMonth() {
  const now = new Date();
  return now.getDate();
}

export default function DashboardScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const {transactions, refreshing, refreshTransactions, userName} = useApp();

  const monthRange = useMemo(() => getCurrentMonthRange(), []);
  const todayRange = useMemo(() => getTodayRange(), []);

  const monthlyTxns = useMemo(
    () =>
      transactions.filter(
        t =>
          t.timestamp >= monthRange.startISO &&
          t.timestamp <= monthRange.endISO,
      ),
    [transactions, monthRange],
  );

  const todayTxns = useMemo(
    () =>
      transactions.filter(
        t =>
          t.timestamp >= todayRange.startISO &&
          t.timestamp <= todayRange.endISO,
      ),
    [transactions, todayRange],
  );

  const monthlySummary = useMemo(
    () => summarizeTransactions(monthlyTxns),
    [monthlyTxns],
  );
  const todaySummary = useMemo(
    () => summarizeTransactions(todayTxns),
    [todayTxns],
  );
  const categoryData = useMemo(
    () => groupByCategory(monthlyTxns),
    [monthlyTxns],
  );

  const latestBalance = useMemo(() => {
    const withBalance = transactions.filter(t => t.balance != null);
    if (!withBalance.length) {
      return 0;
    }
    const sorted = [...withBalance].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );
    return sorted[0].balance;
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  }, [transactions]);

  const avgPerDay = useMemo(() => {
    const days = daysElapsedInMonth() || 1;
    return monthlySummary.debit / days;
  }, [monthlySummary]);

  const balanceColor =
    latestBalance >= 0 ? theme.colors.income : theme.colors.expense;

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: theme.colors.background}]}
      edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshTransactions}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }>
        {/* ── Header ── */}
        <LinearGradient colors={gradients.header} style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <View style={styles.headerGreetingBlock}>
              <Text style={styles.headerGreeting}>
                {getGreeting()}, {getFirstName(userName)}!
              </Text>
              <Text style={styles.headerSubtitle}>
                Here's your financial overview
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}
                style={styles.bellButton}>
                <Icon name="bell-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <Avatar
                  name={userName}
                  size={38}
                  backgroundColor="rgba(255,255,255,0.25)"
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* ── Net Balance Card ── */}
          <Card style={styles.balanceCard} elevation={3}>
            <Text
              style={[
                styles.balanceLabel,
                {color: theme.colors.textSecondary},
              ]}>
              Total Balance
            </Text>
            <Text style={[styles.balanceAmount, {color: balanceColor}]}>
              {formatCurrency(latestBalance)}
            </Text>
          </Card>

          {/* ── Today's Credit / Debit row ── */}
          <View style={styles.row}>
            <Card style={[styles.halfCard, styles.rowCardLeft]} elevation={2}>
              <View style={styles.statIconRow}>
                <View
                  style={[
                    styles.statIconBadge,
                    {backgroundColor: `${theme.colors.income}18`},
                  ]}>
                  <Icon
                    name="arrow-down-circle-outline"
                    size={20}
                    color={theme.colors.income}
                  />
                </View>
              </View>
              <Text
                style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Today's Credit
              </Text>
              <Text style={[styles.statAmount, {color: theme.colors.income}]}>
                {formatCurrency(todaySummary.credit, {compact: true})}
              </Text>
            </Card>

            <Card style={[styles.halfCard, styles.rowCardRight]} elevation={2}>
              <View style={styles.statIconRow}>
                <View
                  style={[
                    styles.statIconBadge,
                    {backgroundColor: `${theme.colors.expense}18`},
                  ]}>
                  <Icon
                    name="arrow-up-circle-outline"
                    size={20}
                    color={theme.colors.expense}
                  />
                </View>
              </View>
              <Text
                style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Today's Debit
              </Text>
              <Text style={[styles.statAmount, {color: theme.colors.expense}]}>
                {formatCurrency(todaySummary.debit, {compact: true})}
              </Text>
            </Card>
          </View>

          {/* ── Monthly summary ── */}
          <Card style={styles.sectionCard} elevation={2}>
            <Text
              style={[styles.sectionTitle, {color: theme.colors.textPrimary}]}>
              This Month
            </Text>
            <IncomeExpenseChart
              income={monthlySummary.credit}
              expense={monthlySummary.debit}
            />
          </Card>

          {/* ── Quick stats row ── */}
          <View style={styles.row}>
            <Card style={[styles.halfCard, styles.rowCardLeft]} elevation={2}>
              <Text
                style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Transactions
              </Text>
              <Text
                style={[styles.statCount, {color: theme.colors.textPrimary}]}>
                {monthlySummary.count}
              </Text>
            </Card>

            <Card style={[styles.halfCard, styles.rowCardRight]} elevation={2}>
              <Text
                style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Avg per day
              </Text>
              <Text
                style={[styles.statCount, {color: theme.colors.textPrimary}]}>
                {formatCurrency(avgPerDay, {compact: true})}
              </Text>
            </Card>
          </View>

          {/* ── Spending by Category ── */}
          {categoryData.length > 0 && (
            <Card style={styles.sectionCard} elevation={2}>
              <Text
                style={[
                  styles.sectionTitle,
                  {color: theme.colors.textPrimary},
                ]}>
                Spending by Category
              </Text>
              <SpendingPieChart data={categoryData} size={220} />
            </Card>
          )}

          {/* ── Recent Transactions ── */}
          <View style={styles.recentHeader}>
            <Text
              style={[styles.sectionTitle, {color: theme.colors.textPrimary}]}>
              Recent Transactions
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Transactions')}>
              <Text style={[styles.seeAll, {color: theme.colors.primary}]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <EmptyState
              icon="bank-outline"
              title="No transactions yet"
              message="Your bank SMS transactions will appear here automatically."
            />
          ) : (
            <Card style={styles.txnCard} elevation={2}>
              {recentTransactions.map((txn, index) => (
                <View key={txn.id}>
                  <TransactionItem
                    transaction={txn}
                    onPress={() =>
                      navigation.navigate('TransactionDetail', {id: txn.id})
                    }
                  />
                  {index < recentTransactions.length - 1 && (
                    <View
                      style={[
                        styles.divider,
                        {backgroundColor: theme.colors.border},
                      ]}
                    />
                  )}
                </View>
              ))}
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerGreetingBlock: {
    flex: 1,
    marginRight: 12,
  },
  headerGreeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '400',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellButton: {
    padding: 6,
  },
  content: {
    padding: 16,
    paddingTop: 20,
    gap: 14,
  },
  balanceCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  rowCardLeft: {},
  rowCardRight: {},
  statIconRow: {
    marginBottom: 8,
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  statCount: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  sectionCard: {
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  txnCard: {
    paddingVertical: 4,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
});
