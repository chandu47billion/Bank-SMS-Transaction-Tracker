import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

function SkeletonRow({ height, animatedOpacity, theme }) {
  return (
    <Animated.View
      style={[
        styles.row,
        {
          height,
          backgroundColor: theme.colors.border,
          opacity: animatedOpacity,
        },
      ]}
    />
  );
}

export default function LoadingSkeleton({ count = 5, height = 64 }) {
  const theme = useTheme();
  const animatedOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedOpacity]);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonRow
          key={index}
          height={height}
          animatedOpacity={animatedOpacity}
          theme={theme}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  row: {
    borderRadius: 12,
    marginBottom: 10,
  },
});
