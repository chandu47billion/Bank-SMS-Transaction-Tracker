import React from 'react';
import {Avatar as PaperAvatar, useTheme} from 'react-native-paper';

function getInitials(name) {
  if (!name) {
    return '?';
  }
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '?';
  }
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function Avatar({name = '', uri, size = 48, backgroundColor}) {
  const theme = useTheme();
  const bgColor = backgroundColor || theme.colors.primary;

  if (uri) {
    return <PaperAvatar.Image size={size} source={{uri}} />;
  }

  return (
    <PaperAvatar.Text
      size={size}
      label={getInitials(name)}
      style={{backgroundColor: bgColor}}
      labelStyle={{color: '#FFFFFF', fontWeight: '700'}}
    />
  );
}
