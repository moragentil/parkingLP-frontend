import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { requestPermissionsAndStartTracking } from './src/services/locationService';
import * as Notifications from 'expo-notifications';
import './src/services/locationTask'; // Importante para que se registre la tarea

// Configura cómo se muestran las notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    // Esta función se ejecuta una sola vez cuando la app se inicia.
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
