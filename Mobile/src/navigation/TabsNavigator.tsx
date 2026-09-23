import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import Menu from '../screens/Menu/Menu';
import DashboardBar from '../components/DashboardBar';

export type TabsParamList = {
  Menu: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

export default function TabsNavigator() {
  return (
    <Tab.Navigator
      tabBar={renderCustomTabBar}
      screenOptions={{headerShown: true, header: renderCompactHeader}}>
      <Tab.Screen name="Menu" component={Menu} options={{title: 'Menú'}} />
    </Tab.Navigator>
  );
}

function renderCompactHeader() {
  return <DashboardBar variant="compact" safeArea="top" />;
}

function renderCustomTabBar(props: BottomTabBarProps) {
  return <CustomTabBar {...props} />;
}

function CustomTabBar(props: BottomTabBarProps) {
  return (
    <DashboardBar
      safeArea="bottom"
      onMenuPress={() => props.navigation.navigate('Menu')}
    />
  );
}
