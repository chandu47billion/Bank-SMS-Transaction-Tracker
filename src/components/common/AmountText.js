import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';
import {formatAmountWithSign} from '../../utils/formatters';

export default function AmountText({amount, type, size = 16, style}) {
  const theme = useTheme();
  const color = type === 'credit' ? theme.colors.income : theme.colors.expense;

  return (
    <Text style={[styles.text, {color, fontSize: size}, style]}>
      {formatAmountWithSign(amount, type)}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '700',
  },
});
