import React, {useState, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useTheme} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

import {useApp} from '../../store/AppContext';
import {
  getMonthRange,
  summarizeTransactions,
  groupByCategory,
  groupByDay,
} from '../../utils/helpers';
import {
  formatCurrency,
  formatAmountWithSign,
  getMonthLabel,
} from '../../utils/formatters';
import {Card, EmptyState} from '../../components/common';
import {
  SpendingPieChart,
  MonthlyTrendChart,
  CategoryBarChart,
} from '../../components/charts';

function getCurrentMonthKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function addMonths(monthKey, delta) {
  const [y, m] = monthKey.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, '0');
  return `${ny}-${nm}`;
}

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function shortMonthLabel(monthKey) {
  const [, m] = monthKey.split('-').map(Number);
  return SHORT_MONTHS[m - 1];
}

export default function AnalyticsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const {transactions} = useApp();

  const [selectedMonthKey, setSelectedMonthKey] = useState(getCurrentMonthKey);

  const goToPrevMonth = useCallback(() => {
    setSelectedMonthKey(prev => addMonths(prev, -1));
  }, []);

  const goToNextMonth = useCallback(() => {
    const next = addMonths(selectedMonthKey, 1);
    if (next <= getCurrentMonthKey()) {
      setSelectedMonthKey(next);
    }
  }, [selectedMonthKey]);

  const isCurrentMonth = selectedMonthKey === getCurrentMonthKey();

  const monthlyTxns = useMemo(() => {
    const {startISO, endISO} = getMonthRange(selectedMonthKey);
    return transactions.filter(
      t => t.timestamp >= startISO && t.timestamp <= endISO,
    );
  }, [transactions, selectedMonthKey]);

  const summary = useMemo(
    () => summarizeTransactions(monthlyTxns),
    [monthlyTxns],
  );

  const categoryData = useMemo(
    () => groupByCategory(monthlyTxns),
    [monthlyTxns],
  );

  const dayData = useMemo(() => groupByDay(monthlyTxns), [monthlyTxns]);

  const trendData = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const mk = addMonths(selectedMonthKey, -i);
      const {startISO, endISO} = getMonthRange(mk);
      const txns = transactions.filter(
        t => t.timestamp >= startISO && t.timestamp <= endISO,
      );
      const s = summarizeTransactions(txns);
      result.push({
        label: shortMonthLabel(mk),
        income: s.credit,
        expense: s.debit,
      });
    }
    return result;
  }, [transactions, selectedMonthKey]);

  const highestIncome = useMemo(() => {
    const credits = monthlyTxns.filter(t => t.type === 'credit');
    if (!credits.length) {
      return null;
    }
    return credits.reduce(
      (max, t) => (t.amount > max.amount ? t : max),
      credits[0],
    );
  }, [monthlyTxns]);

  const highestExpense = useMemo(() => {
    const debits = monthlyTxns.filter(t => t.type === 'debit');
    if (!debits.length) {
      return null;
    }
    return debits.reduce(
      (max, t) => (t.amount > max.amount ? t : max),
      debits[0],
    );
  }, [monthlyTxns]);

  const maxDayDebit = useMemo(
    () => (dayData.length ? Math.max(...dayData.map(d => d.debit)) : 1),
    [dayData],
  );

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: theme.colors.background}]}
      edges={['top']}>
      {/* Month selector */}
      <View
        style={[
          styles.monthSelector,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
          },
        ]}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.chevronBtn}>
          <Icon name="chevron-left" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.monthLabel, {color: theme.colors.textPrimary}]}>
          {getMonthLabel(selectedMonthKey)}
        </Text>
        <TouchableOpacity
          onPress={goToNextMonth}
          style={styles.chevronBtn}
          disabled={isCurrentMonth}>
          <Icon
            name="chevron-right"
            size={28}
            color={isCurrentMonth ? theme.colors.border : theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {monthlyTxns.length === 0 ? (
        <EmptyState
          icon="chart-donut"
          title="No data for this month"
          message="There are no transactions recorded for this month."
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Summary row */}
          <View style={styles.summaryRow}>
            <Card style={[styles.summaryCard, {flex: 1}]} elevation={2}>
              <View
                style={[
                  styles.summaryIconBadge,
                  {backgroundColor: theme.colors.income + '20'},
                ]}>
                <Icon
                  name="arrow-down-circle-outline"
                  size={20}
                  color={theme.colors.income}
                />
              </View>
              <Text
                style={[
                  styles.summaryLabel,
                  {color: theme.colors.textSecondary},
                ]}>
                Income
              </Text>
              <Text
                style={[styles.summaryAmount, {color: theme.colors.income}]}>
                {formatCurrency(summary.credit, {compact: true})}
              </Text>
            </Card>
            <Card style={[styles.summaryCard, {flex: 1}]} elevation={2}>
              <View
                style={[
                  styles.summaryIconBadge,
                  {backgroundColor: theme.colors.expense + '20'},
                ]}>
                <Icon
                  name="arrow-up-circle-outline"
                  size={20}
                  color={theme.colors.expense}
                />
              </View>
              <Text
                style={[
                  styles.summaryLabel,
                  {color: theme.colors.textSecondary},
                ]}>
                Expenses
              </Text>
              <Text
                style={[styles.summaryAmount, {color: theme.colors.expense}]}>
                {formatCurrency(summary.debit, {compact: true})}
              </Text>
            </Card>
            <Card style={[styles.summaryCard, {flex: 1}]} elevation={2}>
              <View
                style={[
                  styles.summaryIconBadge,
                  {backgroundColor: theme.colors.primary + '20'},
                ]}>
                <Icon
                  name="swap-vertical"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.summaryLabel,
                  {color: theme.colors.textSecondary},
                ]}>
                Transactions
              </Text>
              <Text
                style={[
                  styles.summaryAmount,
                  {color: theme.colors.textPrimary},
                ]}>
                {summary.count}
              </Text>
            </Card>
          </View>

          {/* Highlights row */}
          {(highestIncome || highestExpense) && (
            <View style={styles.highlightRow}>
              {highestIncome && (
                <TouchableOpacity
                  style={{flex: 1}}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('TransactionDetail', {
                      id: highestIncome.id,
                    })
                  }>
                  <Card style={styles.highlightCard} elevation={2}>
                    <Text
                      style={[
                        styles.highlightChip,
                        {color: theme.colors.income},
                      ]}>
                      ↑ Highest Income
                    </Text>
                    <Text
                      style={[
                        styles.highlightMerchant,
                        {color: theme.colors.textPrimary},
                      ]}
                      numberOfLines={1}>
                      {highestIncome.merchant ||
                        highestIncome.description ||
                        'Credit'}
                    </Text>
                    <Text
                      style={[
                        styles.highlightAmount,
                        {color: theme.colors.income},
                      ]}>
                      {formatAmountWithSign(highestIncome.amount, 'credit')}
                    </Text>
                  </Card>
                </TouchableOpacity>
              )}
              {highestExpense && (
                <TouchableOpacity
                  style={{flex: 1}}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('TransactionDetail', {
                      id: highestExpense.id,
                    })
                  }>
                  <Card style={styles.highlightCard} elevation={2}>
                    <Text
                      style={[
                        styles.highlightChip,
                        {color: theme.colors.expense},
                      ]}>
                      ↓ Highest Expense
                    </Text>
                    <Text
                      style={[
                        styles.highlightMerchant,
                        {color: theme.colors.textPrimary},
                      ]}
                      numberOfLines={1}>
                      {highestExpense.merchant ||
                        highestExpense.description ||
                        'Debit'}
                    </Text>
                    <Text
                      style={[
                        styles.highlightAmount,
                        {color: theme.colors.expense},
                      ]}>
                      {formatAmountWithSign(highestExpense.amount, 'debit')}
                    </Text>
                  </Card>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Monthly Trend */}
          <Card style={styles.sectionCard} elevation={2}>
            <Text
              style={[styles.sectionTitle, {color: theme.colors.textPrimary}]}>
              Monthly Trend
            </Text>
            <MonthlyTrendChart data={trendData} />
          </Card>

          {/* Category Breakdown */}
          {categoryData.length > 0 && (
            <Card style={styles.sectionCard} elevation={2}>
              <Text
                style={[
                  styles.sectionTitle,
                  {color: theme.colors.textPrimary},
                ]}>
                Category Breakdown
              </Text>
              <SpendingPieChart data={categoryData} size={220} />
            </Card>
          )}

          {/* Top Categories */}
          {categoryData.length > 0 && (
            <Card style={styles.sectionCard} elevation={2}>
              <Text
                style={[
                  styles.sectionTitle,
                  {color: theme.colors.textPrimary},
                ]}>
                Top Categories
              </Text>
              <CategoryBarChart data={categoryData} maxItems={6} />
            </Card>
          )}

          {/* Daily Spending Pattern */}
          {dayData.length > 0 && (
            <Card style={styles.sectionCard} elevation={2}>
              <Text
                style={[
                  styles.sectionTitle,
                  {color: theme.colors.textPrimary},
                ]}>
                Daily Spending Pattern
              </Text>
              <View style={styles.dailyContainer}>
                {dayData.map(day => {
                  const barWidth =
                    maxDayDebit > 0 ? (day.debit / maxDayDebit) * 100 : 0;
                  const dayNum = day.date.split('-')[2];
                  return (
                    <View key={day.date} style={styles.dayRow}>
                      <Text
                        style={[
                          styles.dayLabel,
                          {color: theme.colors.textSecondary},
                        ]}>
                        {dayNum}
                      </Text>
                      <View
                        style={[
                          styles.dayBarTrack,
                          {backgroundColor: theme.colors.border},
                        ]}>
                        <View
                          style={[
                            styles.dayBarFill,
                            {
                              width: `${barWidth}%`,
                              backgroundColor:
                                barWidth > 70
                                  ? theme.colors.expense
                                  : theme.colors.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.dayAmount,
                          {color: theme.colors.textSecondary},
                        ]}>
                        {formatCurrency(day.debit, {compact: true})}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chevronBtn: {
    padding: 8,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
    gap: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
  },
  summaryIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  highlightRow: {
    flexDirection: 'row',
    gap: 12,
  },
  highlightCard: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  highlightChip: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  highlightMerchant: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  highlightAmount: {
    fontSize: 16,
    fontWeight: '800',
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
  dailyContainer: {
    gap: 8,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    width: 24,
    textAlign: 'right',
  },
  dayBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dayBarFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  dayAmount: {
    fontSize: 11,
    fontWeight: '500',
    width: 44,
    textAlign: 'right',
  },
});
