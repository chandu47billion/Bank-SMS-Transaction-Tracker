import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useApp } from '../../store/AppContext';
import { getTransactionById } from '../../database/transactions';
import { CATEGORIES, getCategoryById } from '../../data/categories';
import { getBankById } from '../../data/banks';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { AmountText, Card, Button } from '../../components/common';
import { ConfirmDialog, SuccessDialog, BottomSheet } from '../../components/dialogs';

export default function TransactionDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const { transactions, updateTransactionCategory, removeTransaction } = useApp();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categorySheetVisible, setCategorySheetVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const found = transactions.find(t => t.id === id);
    if (found) {
      setTransaction(found);
      setLoading(false);
    } else {
      getTransactionById(id)
        .then(row => {
          setTransaction(row || null);
        })
        .catch(() => setTransaction(null))
        .finally(() => setLoading(false));
    }
  }, [id, transactions]);

  const handleCategorySelect = useCallback(
    async categoryId => {
      setActionLoading(true);
      try {
        await updateTransactionCategory(id, categoryId);
        setCategorySheetVisible(false);
        setSuccessVisible(true);
      } finally {
        setActionLoading(false);
      }
    },
    [id, updateTransactionCategory],
  );

  const handleDelete = useCallback(async () => {
    setActionLoading(true);
    try {
      await removeTransaction(id);
      setConfirmDeleteVisible(false);
      navigation.goBack();
    } finally {
      setActionLoading(false);
    }
  }, [id, removeTransaction, navigation]);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.colors.background }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.colors.background }]}
        edges={['top']}
      >
        <View style={styles.headerRow}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={theme.colors.textPrimary}
            onPress={() => navigation.goBack()}
          />
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Transaction Details
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.colors.textSecondary }}>Transaction not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const category = getCategoryById(transaction.category);
  const bank = getBankById(transaction.bank);
  const isCredit = transaction.type === 'credit';
  const amountColor = isCredit ? theme.colors.income : theme.colors.expense;

  const detailRows = [
    { label: 'Bank', value: bank ? bank.name : transaction.bank || '—' },
    {
      label: 'Account',
      value: transaction.accountLast4 ? `•• ${transaction.accountLast4}` : '—',
    },
    { label: 'Date & Time', value: formatDateTime(transaction.timestamp) },
    { label: 'Reference No', value: transaction.referenceNo || '—' },
    {
      label: 'Balance After',
      value:
        transaction.balance != null
          ? formatCurrency(transaction.balance)
          : '—',
    },
    { label: 'Type', value: isCredit ? 'Credit' : 'Debit' },
    {
      label: 'Source',
      value: transaction.rawSms
        ? 'Auto-detected from SMS'
        : 'Manually added / Sample data',
    },
  ];

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <View style={[styles.headerRow, { backgroundColor: theme.colors.background }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={theme.colors.textPrimary}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Transaction Details
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category icon circle */}
        <View style={styles.iconSection}>
          <View
            style={[
              styles.categoryCircle,
              { backgroundColor: category.color + '22', borderColor: category.color + '55' },
            ]}
          >
            <Icon name={category.icon} size={48} color={category.color} />
          </View>

          {/* Amount */}
          <AmountText
            amount={transaction.amount}
            type={transaction.type}
            size={34}
            style={[styles.amount, { color: amountColor }]}
          />

          {/* Merchant */}
          <Text style={[styles.merchant, { color: theme.colors.textPrimary }]}>
            {transaction.merchant || transaction.description || 'Transaction'}
          </Text>

          {/* Description (if different from merchant) */}
          {transaction.description &&
            transaction.description !== transaction.merchant && (
              <Text
                style={[styles.description, { color: theme.colors.textSecondary }]}
              >
                {transaction.description}
              </Text>
            )}
        </View>

        {/* Category badge */}
        <View style={styles.categoryBadgeRow}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: category.color + '18', borderColor: category.color + '44' },
            ]}
          >
            <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
            <Text style={[styles.categoryBadgeText, { color: category.color }]}>
              {category.emoji} {category.name}
            </Text>
          </View>
        </View>

        {/* Details card */}
        <Card style={[styles.detailsCard, { borderColor: theme.colors.border }]} elevation={2}>
          {detailRows.map((row, index) => (
            <View key={row.label}>
              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: theme.colors.textSecondary }]}
                >
                  {row.label}
                </Text>
                <Text
                  style={[styles.detailValue, { color: theme.colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {row.value}
                </Text>
              </View>
              {index < detailRows.length - 1 && (
                <View
                  style={[styles.rowDivider, { backgroundColor: theme.colors.border }]}
                />
              )}
            </View>
          ))}
        </Card>

        {/* Raw SMS card */}
        {transaction.rawSms ? (
          <Card style={styles.smsCard} elevation={1}>
            <Text style={[styles.smsSectionTitle, { color: theme.colors.textSecondary }]}>
              Original Message
            </Text>
            <Text
              style={[
                styles.smsText,
                { color: theme.colors.textPrimary, backgroundColor: theme.colors.background },
              ]}
            >
              {transaction.rawSms}
            </Text>
          </Card>
        ) : null}

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <Button
            title="Change Category"
            icon="tag-outline"
            mode="outlined"
            onPress={() => setCategorySheetVisible(true)}
            style={styles.actionBtn}
          />
          <Button
            title="Delete"
            icon="trash-can-outline"
            mode="outlined"
            color={theme.colors.error}
            onPress={() => setConfirmDeleteVisible(true)}
            style={[styles.actionBtn, styles.deleteBtn]}
          />
        </View>
      </ScrollView>

      {/* Category picker BottomSheet */}
      <BottomSheet
        visible={categorySheetVisible}
        onClose={() => setCategorySheetVisible(false)}
        title="Select Category"
      >
        <View style={styles.categoryList}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryRow,
                cat.id === transaction.category && {
                  backgroundColor: cat.color + '18',
                },
              ]}
              onPress={() => handleCategorySelect(cat.id)}
              activeOpacity={0.7}
              disabled={actionLoading}
            >
              <View
                style={[styles.catIconBadge, { backgroundColor: cat.color + '22' }]}
              >
                <Icon name={cat.icon} size={22} color={cat.color} />
              </View>
              <Text
                style={[styles.categoryRowText, { color: theme.colors.textPrimary }]}
              >
                {cat.emoji} {cat.name}
              </Text>
              {cat.id === transaction.category && (
                <Icon name="check" size={20} color={cat.color} style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>

      {/* Delete confirmation */}
      <ConfirmDialog
        visible={confirmDeleteVisible}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteVisible(false)}
      />

      {/* Category updated success */}
      <SuccessDialog
        visible={successVisible}
        title="Category Updated"
        message="The transaction category has been updated successfully."
        onDismiss={() => setSuccessVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    paddingVertical: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  iconSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  categoryCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
  amount: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
  },
  merchant: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 2,
  },
  categoryBadgeRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  smsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  smsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  smsText: {
    fontSize: 13,
    fontStyle: 'italic',
    fontFamily: 'monospace',
    lineHeight: 20,
    borderRadius: 8,
    padding: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
  },
  deleteBtn: {},
  categoryList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 12,
    marginBottom: 2,
  },
  catIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 'auto',
  },
});
