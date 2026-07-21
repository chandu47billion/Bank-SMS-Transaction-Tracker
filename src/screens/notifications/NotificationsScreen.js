import React, {useMemo} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {useTheme, IconButton} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {useApp} from '../../store/AppContext';
import {generateNotifications} from '../../utils/notifications';
import {formatDayLabel, formatTime} from '../../utils/formatters';
import {EmptyState} from '../../components/common';
import {Card} from '../../components/common';

function isToday(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function NotificationsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const {transactions} = useApp();

  const notifications = useMemo(
    () => generateNotifications(transactions),
    [transactions],
  );

  const grouped = useMemo(() => {
    const today = [];
    const earlier = [];
    notifications.forEach(n => {
      if (isToday(n.timestamp)) {
        today.push(n);
      } else {
        earlier.push(n);
      }
    });
    const sections = [];
    if (today.length > 0) {
      sections.push({key: 'today', label: 'Today', items: today});
    }
    if (earlier.length > 0) {
      sections.push({key: 'earlier', label: 'Earlier', items: earlier});
    }
    return sections;
  }, [notifications]);

  const s = styles(theme);

  const renderNotification = item => (
    <Card key={item.id} style={s.notifCard}>
      <View style={s.notifRow}>
        <View style={[s.iconCircle, {backgroundColor: item.color + '22'}]}>
          <Icon name={item.icon} size={22} color={item.color} />
        </View>
        <View style={s.notifBody}>
          <Text style={[s.notifTitle, {color: theme.colors.textPrimary}]}>
            {item.title}
          </Text>
          <Text
            style={[s.notifMessage, {color: theme.colors.textSecondary}]}
            numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={[s.notifTime, {color: theme.colors.textSecondary}]}>
            {formatDayLabel(item.timestamp)} · {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    </Card>
  );

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
          Notifications
        </Text>
        <View style={s.headerSpacer} />
      </View>

      {notifications.length === 0 ? (
        <EmptyState
          icon="bell-off-outline"
          title="No notifications yet"
          message="Notifications will appear here once you have transactions."
        />
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={section => section.key}
          renderItem={({item: section}) => (
            <View>
              <Text
                style={[s.sectionHeader, {color: theme.colors.textSecondary}]}>
                {section.label}
              </Text>
              {section.items.map(n => renderNotification(n))}
            </View>
          )}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    sectionHeader: {
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginTop: 16,
      marginBottom: 6,
      marginLeft: 4,
    },
    notifCard: {
      marginBottom: 10,
      padding: 14,
    },
    notifRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      flexShrink: 0,
    },
    notifBody: {
      flex: 1,
    },
    notifTitle: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 3,
    },
    notifMessage: {
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 5,
    },
    notifTime: {
      fontSize: 11,
    },
  });
