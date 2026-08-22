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
    <Tab.Navigator tabBar={renderCustomTabBar}>
      <Tab.Screen name="Menu" component={Menu} options={{title: 'Menú'}} />
    </Tab.Navigator>
  );
}

function renderCustomTabBar(props: BottomTabBarProps) {
  return <CustomTabBar {...props} />;
}

function CustomTabBar(props: BottomTabBarProps) {
  return <DashboardBar onMenuPress={() => props.navigation.navigate('Menu')} />;
}
