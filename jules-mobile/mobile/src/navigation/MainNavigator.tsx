import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import ChatScreen from '../screens/ChatScreen';
import IDEScreen from '../screens/IDEScreen';
import LoginScreen from '../screens/LoginScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { token } = useAuth();

  if (!token) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="IDE" component={IDEScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
