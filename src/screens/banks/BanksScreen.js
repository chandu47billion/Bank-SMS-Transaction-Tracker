import React, {useMemo} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {useTheme, IconButton} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import {useApp} from '../../store/AppContext';
import {BANKS} from '../../data/banks';
import {formatCurrency, formatDate} from '../../utils/formatters';
import {Card, Avatar} from '../../components/common';

export default function BanksScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const {transactions} = useApp();

  const displayBanks = useMemo(() => BANKS.filter(b => b.id !== 'other'), []);

  const bankStats = useMemo(() => {
    const map = {};
    displayBanks.forEach(b => {
      map[b.id] = {count: 0, credited: 0, debited: 0, latest: null};
    });
    transactions.forEach(t => {
      if (!map[t.bank]) {
        return;
      }
      const stat = map[t.bank];
      stat.count += 1;
      if (t.type === 'credit') {
        stat.credited += t.amount;
      } else {
        stat.debited += t.amount;
      }
      if (!stat.latest || t.timestamp > stat.latest) {
        stat.latest = t.timestamp;
      }
    });
    return map;
  }, [transactions, displayBanks]);

  const s = styles(theme);

  const renderBank = ({item: bank}) => {
    const stat = bankStats[bank.id] || {
      count: 0,
      credited: 0,
      debited: 0,
      latest: null,
    };
    const hasTransactions = stat.count > 0;

    return (
      <Card style={[s.bankCard, !hasTransactions && s.bankCardDimmed]}>
        <View style={s.bankRow}>
          <Avatar
            name={bank.shortCode}
            backgroundColor={bank.color}
            size={48}
          />
          <View style={s.bankInfo}>
            <Text
              style={[s.bankName, {color: theme.colors.textPrimary}]}
              numberOfLines={1}>
              {bank.name}
            </Text>
            {hasTransactions ? (
              <>
                <Text
                  style={[s.bankSubtitle, {color: theme.colors.textSecondary}]}>
                  {stat.count}{' '}
                  {stat.count === 1 ? 'transaction' : 'transactions'}
                </Text>
                {stat.latest && (
                  <Text
                    style={[s.bankLatest, {color: theme.colors.textSecondary}]}>
                    Last: {formatDate(stat.latest, {withYear: false})}
                  </Text>
                )}
              </>
            ) : (
              <Text
                style={[s.bankSubtitle, {color: theme.colors.textSecondary}]}>
                No transactions yet
              </Text>
            )}
          </View>
          {hasTransactions && (
            <View style={s.amountCol}>
              <Text style={[s.creditAmount, {color: theme.colors.income}]}>
                +{formatCurrency(stat.credited, {compact: true})}
              </Text>
              <Text style={[s.debitAmount, {color: theme.colors.expense}]}>
                -{formatCurrency(stat.debited, {compact: true})}
              </Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

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
          Linked Banks
        </Text>
        <View style={s.headerSpacer} />
      </View>

      <FlatList
        data={displayBanks}
        keyExtractor={b => b.id}
        renderItem={renderBank}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View
            style={[
              s.infoBanner,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <Text style={[s.infoText, {color: theme.colors.textSecondary}]}>
              MoneyFlow automatically detects transactions from these supported
              banks based on SMS sender IDs.
            </Text>
          </View>
        }
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
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    infoBanner: {
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 16,
      marginTop: 4,
    },
    infoText: {
      fontSize: 13,
      lineHeight: 19,
    },
    bankCard: {
      marginBottom: 12,
      padding: 14,
    },
    bankCardDimmed: {
      opacity: 0.5,
    },
    bankRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    bankInfo: {
      flex: 1,
      marginLeft: 14,
    },
    bankName: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 3,
    },
    bankSubtitle: {
      fontSize: 13,
    },
    bankLatest: {
      fontSize: 11,
      marginTop: 2,
    },
    amountCol: {
      alignItems: 'flex-end',
    },
    creditAmount: {
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 2,
    },
    debitAmount: {
      fontSize: 13,
      fontWeight: '700',
    },
  });
