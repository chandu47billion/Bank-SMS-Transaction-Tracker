import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryTheme,
} from 'victory-native';
import { formatCompactNumber } from '../../utils/formatters';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MonthlyTrendChart({ data = [], width, height = 220 }) {
  const theme = useTheme();
  const { colors } = theme;

  const chartWidth = width ?? SCREEN_WIDTH - 64;

  const validData = (data || []).filter(
    d => d.income > 0 || d.expense > 0
  );

  if (validData.length === 0) {
    return (
      <View style={[styles.emptyContainer, { minHeight: height }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No data yet
        </Text>
      </View>
    );
  }

  const incomeLineData = validData.map((d, i) => ({ x: i + 1, y: d.income }));
  const expenseLineData = validData.map((d, i) => ({ x: i + 1, y: d.expense }));

  const tickStep = validData.length > 8 ? 2 : 1;
  const tickValues = validData
    .map((_, i) => i + 1)
    .filter(i => (i - 1) % tickStep === 0);

  return (
    <View style={styles.container}>
      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
        <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Income</Text>
        <View style={[styles.legendDot, { backgroundColor: colors.expense, marginLeft: 16 }]} />
        <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Expense</Text>
      </View>

      <VictoryChart
        width={chartWidth}
        height={height}
        theme={VictoryTheme.material}
        domainPadding={{ y: [10, 20] }}
      >
        <VictoryAxis
          tickValues={tickValues}
          tickFormat={i => validData[i - 1]?.label ?? ''}
          style={{
            axis: { stroke: colors.border },
            tickLabels: {
              fill: colors.textSecondary,
              fontSize: validData.length > 6 ? 9 : 11,
              angle: validData.length > 6 ? -30 : 0,
            },
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
          tickFormat={t => `₹${formatCompactNumber(t)}`}
        />
        <VictoryLine
          data={incomeLineData}
          style={{
            data: { stroke: colors.income, strokeWidth: 2.5 },
          }}
          animate={{ duration: 400 }}
        />
        <VictoryLine
          data={expenseLineData}
          style={{
            data: { stroke: colors.expense, strokeWidth: 2.5 },
          }}
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
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 13,
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
