import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTheme,
} from 'victory-native';
import { formatCurrency } from '../../utils/formatters';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function IncomeExpenseChart({ income = 0, expense = 0, width, height = 220 }) {
  const theme = useTheme();
  const { colors } = theme;

  const chartWidth = width ?? SCREEN_WIDTH - 64;

  const hasData = income > 0 || expense > 0;

  if (!hasData) {
    return (
      <View style={[styles.emptyContainer, { minHeight: height }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No data yet
        </Text>
      </View>
    );
  }

  const barData = [
    { x: 'Income', y: income, fill: colors.income },
    { x: 'Expense', y: expense, fill: colors.expense },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryAmount, { color: colors.income }]}>
          +{formatCurrency(income)}
        </Text>
        <Text style={[styles.summaryAmount, { color: colors.expense }]}>
          -{formatCurrency(expense)}
        </Text>
      </View>

      <VictoryChart
        width={chartWidth}
        height={height}
        theme={VictoryTheme.material}
        domainPadding={{ x: 40 }}
      >
        <VictoryAxis
          style={{
            axis: { stroke: colors.border },
            tickLabels: { fill: colors.textSecondary, fontSize: 12 },
            grid: { stroke: 'transparent' },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: 'transparent' },
            tickLabels: { fill: colors.textSecondary, fontSize: 11 },
            grid: { stroke: colors.border, strokeDasharray: '4,4' },
          }}
          tickFormat={t => {
            if (Math.abs(t) >= 100000) return `₹${(t / 100000).toFixed(0)}L`;
            if (Math.abs(t) >= 1000) return `₹${(t / 1000).toFixed(0)}K`;
            return `₹${t}`;
          }}
        />
        <VictoryBar
          data={barData}
          style={{
            data: {
              fill: ({ datum }) => datum.fill,
              borderRadius: 4,
            },
          }}
          barWidth={chartWidth / 6}
          cornerRadius={{ top: 4 }}
          animate={{ duration: 400 }}
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
  },
});
