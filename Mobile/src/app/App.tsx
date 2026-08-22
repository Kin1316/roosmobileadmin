import React from 'react';
import {StyleSheet, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import RootNavigator from '../navigation/RootNavigator';
import '../i18n';
import {navigationTheme, theme} from '../theme';

export default function App() {
  return (
    <View style={styles.container}>
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: theme.colors.background},
});
