import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { requestPermissionsAndStartTracking } from './src/services/locationService';

import './src/services/locationTask';

export default function App() {

  useEffect(() => {
    const initializeApp = async () => {
      await requestPermissionsAndStartTracking();
    };
    initializeApp();
  }, []);

  return (
    <>
      <AppNavigator />
    </>
  );
}
