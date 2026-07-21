import React, {useMemo, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {useTheme, ProgressBar, TextInput} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {useApp} from '../../store/AppContext';
import {CATEGORIES} from '../../data/categories';
import {
  getCurrentMonthRange,
  groupByCategory,
  clamp,
} from '../../utils/helpers';
import {formatCurrency, getMonthLabel} from '../../utils/formatters';
import {IncomeExpenseChart} from '../../components/charts';
import {Card, Button} from '../../components/common';
import {BottomSheet, SuccessDialog} from '../../components/dialogs';

function getCurrentMonthKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function BudgetScreen() {
  const theme = useTheme();
  const {transactions, budgets, updateBudget} = useApp();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const monthKey = useMemo(() => getCurrentMonthKey(), []);
  const monthLabel = useMemo(() => getMonthLabel(monthKey), [monthKey]);

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

  const spendByCategoryId = useMemo(() => {
    const grouped = groupByCategory(monthlyTxns);
    const map = {};
    grouped.forEach(({categoryId, total}) => {
      map[categoryId] = total;
    });
    return map;
  }, [monthlyTxns]);

  const budgetByCategoryId = useMemo(() => {
    const map = {};
    budgets.forEach(b => {
      map[b.categoryId] = b.limitAmount;
    });
    return map;
  }, [budgets]);

  const totalBudget = useMemo(
    () => budgets.reduce((sum, b) => sum + (b.limitAmount || 0), 0),
    [budgets],
  );

  const totalSpent = useMemo(
    () => Object.values(spendByCategoryId).reduce((sum, v) => sum + v, 0),
    [spendByCategoryId],
  );

  const overspendingCount = useMemo(() => {
    return CATEGORIES.filter(cat => {
      const limit = budgetByCategoryId[cat.id] || 0;
      const spent = spendByCategoryId[cat.id] || 0;
      return limit > 0 && spent > limit;
    }).length;
  }, [budgetByCategoryId, spendByCategoryId]);

  const openSheet = useCallback(
    cat => {
      setSelectedCategory(cat);
      const current = budgetByCategoryId[cat.id];
      setInputValue(current ? String(current) : '');
      setSheetVisible(true);
    },
    [budgetByCategoryId],
  );

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
    setSelectedCategory(null);
    setInputValue('');
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedCategory) {
      return;
    }
    const amount = Number(inputValue);
    if (!amount || amount <= 0) {
      return;
    }
    setSaving(true);
    try {
      await updateBudget(selectedCategory.id, amount);
      closeSheet();
      setSuccessVisible(true);
    } finally {
      setSaving(false);
    }
  }, [selectedCategory, inputValue, updateBudget, closeSheet]);

  const s = styles(theme);

  const renderCategoryRow = useCallback(
    ({item: cat}) => {
      const spent = spendByCategoryId[cat.id] || 0;
      const limit = budgetByCategoryId[cat.id] || 0;
      const hasBudget = limit > 0;
      const progress = hasBudget ? clamp(spent / limit, 0, 1) : 0;
      const isOverspent = hasBudget && spent > limit;
      const remaining = limit - spent;
      const overage = spent - limit;
      const barColor = isOverspent
        ? theme.colors.expense
        : theme.colors.primary;

      return (
        <TouchableOpacity onPress={() => openSheet(cat)} activeOpacity={0.75}>
          <Card style={s.categoryCard}>
            <View style={s.categoryRow}>
              <View style={[s.iconCircle, {backgroundColor: cat.color + '22'}]}>
                <Text style={s.emoji}>{cat.emoji}</Text>
              </View>
              <View style={s.categoryInfo}>
                <Text style={s.categoryName}>{cat.name}</Text>
                {hasBudget ? (
                  <>
                    <ProgressBar
                      progress={progress}
                      color={barColor}
                      style={s.progressBar}
                    />
                    <View style={s.budgetTextRow}>
                      <Text style={s.budgetMeta}>
                        {formatCurrency(spent)} of {formatCurrency(limit)}
                      </Text>
                      {isOverspent ? (
                        <Text
                          style={[
                            s.remainingText,
                            {color: theme.colors.expense},
                          ]}>
                          Over by {formatCurrency(overage)}
                        </Text>
                      ) : (
                        <Text
                          style={[
                            s.remainingText,
                            {color: theme.colors.textSecondary},
                          ]}>
                          {formatCurrency(remaining)} left
                        </Text>
                      )}
                    </View>
                  </>
                ) : (
                  <View style={s.noBudgetRow}>
                    <Text style={s.budgetMeta}>
                      {spent > 0
                        ? `${formatCurrency(spent)} spent`
                        : 'No spending yet'}
                    </Text>
                    <Text
                      style={[s.setBudgetLink, {color: theme.colors.primary}]}>
                      Set Budget
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      );
    },
    [spendByCategoryId, budgetByCategoryId, theme, openSheet, s],
  );

  return (
    <SafeAreaView
      style={[s.safe, {backgroundColor: theme.colors.background}]}
      edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Budget</Text>
        <Text style={s.headerSubtitle}>{monthLabel}</Text>
      </View>

      <FlatList
        data={CATEGORIES}
        keyExtractor={cat => cat.id}
        renderItem={renderCategoryRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <>
            {overspendingCount > 0 && (
              <View
                style={[
                  s.alertBanner,
                  {
                    backgroundColor: theme.colors.expense + '18',
                    borderColor: theme.colors.expense,
                  },
                ]}>
                <Icon
                  name="alert-circle"
                  size={16}
                  color={theme.colors.expense}
                />
                <Text style={[s.alertText, {color: theme.colors.expense}]}>
                  {' '}
                  You are overspending in {overspendingCount}{' '}
                  {overspendingCount === 1 ? 'category' : 'categories'}
                </Text>
              </View>
            )}

            <Card style={s.summaryCard}>
              <Text style={s.summaryTitle}>Total Budget</Text>
              <IncomeExpenseChart income={totalBudget} expense={totalSpent} />
              <View style={s.summaryRow}>
                <View style={s.summaryItem}>
                  <Text
                    style={[
                      s.summaryLabel,
                      {color: theme.colors.textSecondary},
                    ]}>
                    Budgeted
                  </Text>
                  <Text style={[s.summaryAmount, {color: theme.colors.income}]}>
                    {formatCurrency(totalBudget)}
                  </Text>
                </View>
                <View style={s.summaryItem}>
                  <Text
                    style={[
                      s.summaryLabel,
                      {color: theme.colors.textSecondary},
                    ]}>
                    Spent
                  </Text>
                  <Text
                    style={[s.summaryAmount, {color: theme.colors.expense}]}>
                    {formatCurrency(totalSpent)}
                  </Text>
                </View>
              </View>
            </Card>

            <Text style={[s.sectionLabel, {color: theme.colors.textSecondary}]}>
              Categories
            </Text>
          </>
        }
      />

      <BottomSheet
        visible={sheetVisible}
        onClose={closeSheet}
        title={
          selectedCategory
            ? `Set Budget — ${selectedCategory.name}`
            : 'Set Budget'
        }>
        <View style={s.sheetContent}>
          {selectedCategory && (
            <View style={s.sheetCategoryRow}>
              <View
                style={[
                  s.iconCircle,
                  {backgroundColor: selectedCategory.color + '22'},
                ]}>
                <Text style={s.emoji}>{selectedCategory.emoji}</Text>
              </View>
              <Text
                style={[
                  s.sheetCategoryName,
                  {color: theme.colors.textPrimary},
                ]}>
                {selectedCategory.name}
              </Text>
            </View>
          )}
          <TextInput
            label="Monthly Limit (₹)"
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType="numeric"
            mode="outlined"
            style={s.input}
            left={<TextInput.Affix text="₹" />}
          />
          <Button
            title="Save Budget"
            onPress={handleSave}
            mode="contained"
            loading={saving}
            disabled={!inputValue || Number(inputValue) <= 0 || saving}
            fullWidth
            style={s.saveBtn}
          />
        </View>
      </BottomSheet>

      <SuccessDialog
        visible={successVisible}
        title="Budget Updated"
        message="Your budget limit has been saved successfully."
        onDismiss={() => setSuccessVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = theme =>
  StyleSheet.create({
    safe: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    alertBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 12,
      marginTop: 4,
    },
    alertText: {
      fontSize: 13,
      fontWeight: '600',
    },
    summaryCard: {
      marginBottom: 8,
      padding: 16,
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 8,
    },
    summaryItem: {
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: 12,
    },
    summaryAmount: {
      fontSize: 18,
      fontWeight: '700',
      marginTop: 2,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginTop: 8,
      marginBottom: 4,
      marginLeft: 4,
    },
    categoryCard: {
      marginBottom: 10,
      padding: 14,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    emoji: {
      fontSize: 22,
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 6,
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
    },
    budgetTextRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 5,
    },
    budgetMeta: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    remainingText: {
      fontSize: 12,
      fontWeight: '500',
    },
    noBudgetRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2,
    },
    setBudgetLink: {
      fontSize: 12,
      fontWeight: '600',
    },
    sheetContent: {
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    sheetCategoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    sheetCategoryName: {
      fontSize: 17,
      fontWeight: '700',
      marginLeft: 12,
    },
    input: {
      marginBottom: 20,
    },
    saveBtn: {
      marginBottom: 8,
    },
  });
