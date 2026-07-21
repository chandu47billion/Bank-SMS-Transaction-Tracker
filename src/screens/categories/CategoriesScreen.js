import React, {useMemo, useState, useCallback} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {useTheme, IconButton} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import {useApp} from '../../store/AppContext';
import {CATEGORIES} from '../../data/categories';
import {getCurrentMonthRange} from '../../utils/helpers';
import {formatCurrency} from '../../utils/formatters';
import {Card, TransactionItem, EmptyState} from '../../components/common';
import {BottomSheet} from '../../components/dialogs';

export default function CategoriesScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const {transactions} = useApp();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const monthRange = useMemo(() => getCurrentMonthRange(), []);

  const monthlyDebits = useMemo(
    () =>
      transactions.filter(
        t =>
          t.type === 'debit' &&
          t.timestamp >= monthRange.startISO &&
          t.timestamp <= monthRange.endISO,
      ),
    [transactions, monthRange],
  );

  const spendByCategoryId = useMemo(() => {
    const map = {};
    monthlyDebits.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }, [monthlyDebits]);

  const categoryTransactions = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }
    return monthlyDebits
      .filter(t => t.category === selectedCategory.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [monthlyDebits, selectedCategory]);

  const openSheet = useCallback(cat => {
    setSelectedCategory(cat);
    setSheetVisible(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
    setSelectedCategory(null);
  }, []);

  const handleTransactionPress = useCallback(
    txn => {
      closeSheet();
      setTimeout(() => {
        navigation.navigate('TransactionDetail', {id: txn.id});
      }, 250);
    },
    [navigation, closeSheet],
  );

  const s = styles(theme);

  const renderCategory = useCallback(
    ({item: cat}) => {
      const spent = spendByCategoryId[cat.id] || 0;
      return (
        <TouchableOpacity
          style={s.cardWrapper}
          onPress={() => openSheet(cat)}
          activeOpacity={0.78}>
          <Card style={s.categoryCard}>
            <View style={[s.colorBar, {backgroundColor: cat.color}]} />
            <View style={s.cardBody}>
              <View style={[s.iconCircle, {backgroundColor: cat.color + '22'}]}>
                <Text style={s.emoji}>{cat.emoji}</Text>
              </View>
              <Text
                style={[s.catName, {color: theme.colors.textPrimary}]}
                numberOfLines={1}>
                {cat.name}
              </Text>
              <Text
                style={[
                  s.catSpend,
                  {
                    color:
                      spent > 0
                        ? theme.colors.expense
                        : theme.colors.textSecondary,
                  },
                ]}>
                {formatCurrency(spent, {compact: true})}
              </Text>
              <Text
                style={[s.catSpendLabel, {color: theme.colors.textSecondary}]}>
                spent this month
              </Text>
            </View>
          </Card>
        </TouchableOpacity>
      );
    },
    [spendByCategoryId, theme, openSheet, s],
  );

  return (
    <SafeAreaView
      style={[s.safe, {backgroundColor: theme.colors.background}]}
      edges={['top']}>
      <View style={s.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={theme.colors.textPrimary}
          onPress={() => navigation.goBack()}
          style={s.backBtn}
        />
        <Text style={[s.headerTitle, {color: theme.colors.textPrimary}]}>
          Categories
        </Text>
        <View style={s.headerSpacer} />
      </View>

      <FlatList
        data={CATEGORIES}
        keyExtractor={cat => cat.id}
        renderItem={renderCategory}
        numColumns={2}
        contentContainerStyle={s.grid}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={s.row}
      />

      <BottomSheet
        visible={sheetVisible}
        onClose={closeSheet}
        title={
          selectedCategory
            ? `${selectedCategory.emoji}  ${selectedCategory.name}`
            : ''
        }>
        <View style={s.sheetContent}>
          {categoryTransactions.length === 0 ? (
            <EmptyState
              icon="receipt"
              title="No transactions"
              message="No spending in this category this month."
            />
          ) : (
            categoryTransactions.map(txn => (
              <TransactionItem
                key={txn.id}
                transaction={txn}
                onPress={() => handleTransactionPress(txn)}
              />
            ))
          )}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = theme =>
  StyleSheet.create({
    safe: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 16,
      paddingTop: 4,
      paddingBottom: 8,
    },
    backBtn: {
      margin: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      flex: 1,
    },
    headerSpacer: {
      width: 40,
    },
    grid: {
      paddingHorizontal: 12,
      paddingBottom: 24,
    },
    row: {
      justifyContent: 'space-between',
    },
    cardWrapper: {
      width: '48%',
      marginBottom: 12,
    },
    categoryCard: {
      padding: 0,
      overflow: 'hidden',
    },
    colorBar: {
      height: 4,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    cardBody: {
      padding: 14,
      alignItems: 'center',
    },
    iconCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    emoji: {
      fontSize: 26,
    },
    catName: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 6,
      textAlign: 'center',
    },
    catSpend: {
      fontSize: 17,
      fontWeight: '800',
      textAlign: 'center',
    },
    catSpendLabel: {
      fontSize: 11,
      marginTop: 2,
      textAlign: 'center',
    },
    sheetContent: {
      paddingHorizontal: 12,
      paddingBottom: 16,
    },
  });
