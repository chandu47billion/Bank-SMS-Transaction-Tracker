import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { VictoryPie } from 'victory-native';
import { formatCurrency } from '../../utils/formatters';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SpendingPieChart({ data = [], size = 220 }) {
  const theme = useTheme();
  const { colors } = theme;

  const validData = (data || []).filter(d => d.total > 0);

  if (validData.length === 0) {
    return (
      <View style={[styles.emptyContainer, { minHeight: size }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No data yet
        </Text>
      </View>
    );
  }

  const topItems = validData.slice(0, 6);
  const pieData = topItems.map(d => ({ x: d.category.name, y: d.total }));
  const colorScale = topItems.map(d => d.category.color);

  return (
    <View style={styles.container}>
      <View style={styles.pieWrapper}>
        <VictoryPie
          data={pieData}
          colorScale={colorScale}
          width={size}
          height={size}
          radius={size / 2 - 8}
          innerRadius={size / 4}
          labels={() => null}
          style={{ parent: { overflow: 'visible' } }}
          padding={8}
        />
      </View>

      <View style={styles.legend}>
        {topItems.map((item, index) => (
          <View key={item.categoryId ?? index} style={styles.legendRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: item.category.color },
              ]}
            />
            <Text
              style={[styles.legendName, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {item.category.emoji ? `${item.category.emoji} ` : ''}
              {item.category.name}
            </Text>
            <Text style={[styles.legendAmount, { color: colors.textSecondary }]}>
              {formatCurrency(item.total, { compact: true })}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  pieWrapper: {
    alignItems: 'center',
  },
  legend: {
    width: '100%',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
    flexShrink: 0,
  },
  legendName: {
    flex: 1,
    fontSize: 13,
  },
  legendAmount: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
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
