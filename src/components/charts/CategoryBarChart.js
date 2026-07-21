import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { formatCurrency } from '../../utils/formatters';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CategoryBarChart({ data = [], maxItems = 6, width }) {
  const theme = useTheme();
  const { colors } = theme;

  const chartWidth = width ?? SCREEN_WIDTH - 64;

  const validData = (data || []).filter(d => d.total > 0);

  if (validData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No spending data yet
        </Text>
      </View>
    );
  }

  const topItems = validData.slice(0, maxItems);
  const maxTotal = topItems[0].total;

  return (
    <View style={[styles.container, { width: chartWidth }]}>
      {topItems.map((item, index) => {
        const barPercent = Math.min((item.total / maxTotal) * 100, 100);
        return (
          <View key={item.categoryId ?? index} style={styles.row}>
            {/* Label row: emoji + name + amount */}
            <View style={styles.labelRow}>
              <Text style={[styles.categoryLabel, { color: colors.textPrimary }]} numberOfLines={1}>
                {item.category.emoji ? `${item.category.emoji} ` : ''}
                {item.category.name}
              </Text>
              <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
                {formatCurrency(item.total, { compact: true })}
              </Text>
            </View>

            {/* Bar track */}
            <View style={[styles.track, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.fill,
                  {
                    backgroundColor: item.category.color,
                    width: `${barPercent}%`,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  row: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
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
