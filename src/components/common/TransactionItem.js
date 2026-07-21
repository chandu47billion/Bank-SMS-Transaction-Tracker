import React from 'react';
import {View, TouchableOpacity, StyleSheet, Text} from 'react-native';
import {useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {getCategoryById} from '../../data/categories';
import {
  formatAmountWithSign,
  formatDayLabel,
  formatTime,
} from '../../utils/formatters';

export default function TransactionItem({transaction, onPress}) {
  const theme = useTheme();
  const category = getCategoryById(transaction.category);
  const isCredit = transaction.type === 'credit';
  const amountColor = isCredit ? theme.colors.income : theme.colors.expense;
  const bankLabel = transaction.bank ? transaction.bank.toUpperCase() : '';
  const accountSuffix = transaction.accountLast4
    ? `•• ${transaction.accountLast4}`
    : '';
  const subtitle = [
    bankLabel,
    accountSuffix,
    formatDayLabel(transaction.timestamp),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <TouchableOpacity
      style={[styles.row, {backgroundColor: theme.colors.surface}]}
      onPress={() => onPress && onPress(transaction)}
      activeOpacity={0.75}>
      {/* Left: category icon avatar */}
      <View style={[styles.avatar, {backgroundColor: category.color + '22'}]}>
        <Icon name={category.icon} size={22} color={category.color} />
      </View>

      {/* Middle: merchant + subtitle */}
      <View style={styles.middle}>
        <Text
          style={[styles.merchant, {color: theme.colors.textPrimary}]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {transaction.merchant || transaction.description || 'Transaction'}
        </Text>
        <Text
          style={[styles.subtitle, {color: theme.colors.textSecondary}]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {subtitle}
        </Text>
      </View>

      {/* Right: amount + time */}
      <View style={styles.right}>
        <Text style={[styles.amount, {color: amountColor}]}>
          {formatAmountWithSign(transaction.amount, transaction.type)}
        </Text>
        <Text style={[styles.time, {color: theme.colors.textSecondary}]}>
          {formatTime(transaction.timestamp)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  middle: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  merchant: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 0,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  time: {
    fontSize: 11,
  },
});
