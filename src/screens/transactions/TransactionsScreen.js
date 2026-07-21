import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { useApp } from '../../store/AppContext';
import { BANKS } from '../../data/banks';
import { getDateRangeForFilter } from '../../utils/helpers';
import { TransactionItem, FilterChip, EmptyState, SearchBar } from '../../components/common';

const PAGE_SIZE = 20;

const DATE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

export default function TransactionsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { transactions, refreshing, refreshTransactions } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeDateFilter, setActiveDateFilter] = useState('all');
  const [activeBankFilter, setActiveBankFilter] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let result = transactions;

    if (activeDateFilter !== 'all') {
      const { startISO, endISO } = getDateRangeForFilter(activeDateFilter);
      result = result.filter(
        t => t.timestamp >= startISO && t.timestamp <= endISO,
      );
    }

    if (activeBankFilter) {
      result = result.filter(t => t.bank === activeBankFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        t =>
          (t.merchant && t.merchant.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.bank && t.bank.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)),
      );
    }

    return [...result].sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
  }, [transactions, activeDateFilter, activeBankFilter, searchQuery]);

  const visibleData = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

  const handleEndReached = useCallback(() => {
    if (visibleCount < filtered.length) {
      setVisibleCount(prev => prev + PAGE_SIZE);
    }
  }, [visibleCount, filtered.length]);

  const handleDateFilter = useCallback(key => {
    setActiveDateFilter(key);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleBankFilter = useCallback(bankId => {
    setActiveBankFilter(prev => (prev === bankId ? null : bankId));
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleSearchChange = useCallback(text => {
    setSearchQuery(text);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const hasActiveFilters =
    searchQuery.trim() || activeDateFilter !== 'all' || activeBankFilter;

  const emptyTitle = hasActiveFilters
    ? 'No matching transactions'
    : 'No transactions yet';
  const emptyMessage = hasActiveFilters
    ? 'Try adjusting your search or filters.'
    : 'Your bank SMS transactions will appear here automatically.';

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

  const listHeader = (
    <View style={[styles.filtersContainer, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {DATE_FILTERS.map(f => (
          <FilterChip
            key={f.key}
            label={f.label}
            selected={activeDateFilter === f.key}
            onPress={() => handleDateFilter(f.key)}
          />
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        <FilterChip
          label="All Banks"
          icon="bank"
          selected={activeBankFilter === null}
          onPress={() => {
            setActiveBankFilter(null);
            setVisibleCount(PAGE_SIZE);
          }}
        />
        {BANKS.map(bank => (
          <FilterChip
            key={bank.id}
            label={bank.shortCode}
            icon="bank"
            selected={activeBankFilter === bank.id}
            onPress={() => handleBankFilter(bank.id)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const listEmpty = (
    <EmptyState
      icon={hasActiveFilters ? 'filter-remove-outline' : 'bank-outline'}
      title={emptyTitle}
      message={emptyMessage}
    />
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Transactions
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Search')}
          style={styles.searchIcon}
        >
          <Icon name="magnify" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBarContainer, { backgroundColor: theme.colors.background }]}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search transactions..."
        />
      </View>

      <FlatList
        data={visibleData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshTransactions}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={
          filtered.length === 0 ? styles.emptyContent : styles.listContent
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  searchIcon: {
    padding: 4,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filtersContainer: {
    paddingVertical: 4,
    gap: 4,
  },
  chipRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
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
