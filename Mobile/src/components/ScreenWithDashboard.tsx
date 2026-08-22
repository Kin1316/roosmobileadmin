import React from 'react';
import {View, StyleSheet} from 'react-native';
import DashboardBar from './DashboardBar';
import {theme} from '../theme';

interface ScreenWithDashboardProps {
  children: React.ReactNode;
  onMenuPress: () => void;
}

export default function ScreenWithDashboard({children, onMenuPress}: ScreenWithDashboardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>{children}</View>
      <DashboardBar onMenuPress={onMenuPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {flex: 1},
});
