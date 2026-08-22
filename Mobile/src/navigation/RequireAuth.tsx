import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useAuthStore} from '../store/auth.store';

interface Props {
  children: React.ReactNode;
}

export default function RequireAuth({children}: Props) {
  const token = useAuthStore(s => s.token);
  if (!token) {
    // Render nothing; navigator will redirect to Login screen
    return <View style={styles.empty} />;
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  empty: {flex: 1},
});
