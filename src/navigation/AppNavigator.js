import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import MainLayout from '../components/MainLayout';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainLayout"
        screenOptions={{
          animationEnabled: false, // Deshabilitar animaciones de transición
          headerShown: false, // Ocultar el encabezado predeterminado
        }}
      >
        <Stack.Screen name="MainLayout" component={MainLayout} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}