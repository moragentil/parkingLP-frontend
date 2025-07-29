import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Alert, Linking } from 'react-native';
import { LOCATION_TASK_NAME } from './locationTask';

export const requestPermissionsAndStartTracking = async () => {
  // 1. Permisos (sin cambios)
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    Alert.alert('Permiso denegado', 'No podemos acceder a la ubicación.');
    return false;
  }

  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== 'granted') {
    Alert.alert(
      'Permiso de background requerido',
      "Para recibir alertas cuando la app está cerrada, por favor, activa el permiso 'Permitir siempre' en la configuración.",
      [{ text: "Abrir Configuración", onPress: () => Linking.openSettings() }, { text: "Cancelar" }]
    );
  }

  // ✅ 2. Comprobar si la tarea ya está activa
  const isTaskRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (isTaskRunning) {
    console.log('La tarea de ubicación ya estaba corriendo. No se inicia de nuevo.');
    return true;
  }

  // ✅ 3. Iniciar el monitoreo con la configuración del servicio en primer plano
  console.log('Iniciando la tarea de ubicación en segundo plano...');
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Highest,
    timeInterval: 10000,
    distanceInterval: 20,
    // Esto es lo más importante:
    foregroundService: {
        notificationTitle: "Parking LP está activo",
        notificationBody: "Monitoreando tu ubicación para recordarte desactivar el estacionamiento.",
        notificationColor: "#3236FF" // Opcional: color del ícono
    }
  });
  console.log('Servicio de ubicación en segundo plano iniciado correctamente.');
  return true;
};