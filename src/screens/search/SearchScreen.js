import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { useApp } from '../../store/AppContext';
import { debounce } from '../../utils/helpers';
import { TransactionItem, EmptyState, SearchBar } from '../../components/common';

export default function SearchScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { transactions } = useApp();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debouncedSet = useRef(debounce(setDebouncedQuery, 300)).current;

  const handleChangeText = useCallback(
    text => {
      setQuery(text);
      debouncedSet(text);
    },
    [debouncedSet],
  );

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];
    return transactions.filter(
      t =>
        (t.merchant && t.merchant.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.bank && t.bank.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.referenceNo && t.referenceNo.toLowerCase().includes(q)),
    );
  }, [transactions, debouncedQuery]);

  const renderItem = useCallback(
    ({ item }) => (
      <TransactionItem
        transaction={item}
        onPress={() => navigation.navigate('TransactionDetail', { id: item.id })}
      />
    ),
    [navigation],
  );

  const renderSeparator = useCallback(
    () => (
      <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
    ),
    [theme.colors.border],
  );

  const hasQuery = query.trim().length > 0;

  const emptyComponent = useMemo(() => {
    if (!hasQuery) {
      return (
        <EmptyState
          icon="magnify"
          title="Search Transactions"
          message="Search by merchant, bank, category, or reference number."
        />
      );
    }
    return (
      <EmptyState
        icon="text-search"
        title="No results found"
        message={`No transactions found for "${query.trim()}"`}
      />
    );
  }, [hasQuery, query]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <View
        style={[
          styles.searchRow,
          { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.background },
        ]}
      >
        <View
          style={[
            styles.backBtn,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Icon
            name="arrow-left"
            size={24}
            color={theme.colors.textPrimary}
            onPress={() => navigation.goBack()}
          />
        </View>
        <View style={styles.searchBarWrapper}>
          <SearchBar
            value={query}
            onChangeText={handleChangeText}
            placeholder="Search transactions..."
            autoFocus
          />
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={emptyComponent}
        contentContainerStyle={
          results.length === 0 ? styles.emptyContent : styles.listContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  backBtn: {
    padding: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarWrapper: {
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContent: {
    flexGrow: 1,
  },
});
