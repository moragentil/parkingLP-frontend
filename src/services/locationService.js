import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Alert, Linking } from 'react-native';
import { LOCATION_TASK_NAME } from './locationTask';

export const requestPermissionsAndStartTracking = async () => {
    // 1. Permiso de Notificaciones
  const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
  if (notificationStatus !== 'granted') {
    Alert.alert('Permiso requerido', 'Necesitamos permisos de notificaciones para enviarte alertas.');
    // No detenemos el flujo, ya que la localización puede funcionar igual.
  }

  // 2. Permiso de Ubicación en primer plano
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    Alert.alert('Permiso denegado', 'No podemos acceder a la ubicación para activar las alertas.');
    return false;
  }

  // 3. Permiso de Ubicación en segundo plano
  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== 'granted') {
    Alert.alert(
      'Permiso de background requerido',
      "Para recibir alertas cuando la app está cerrada, por favor, activa el permiso 'Permitir siempre' en la configuración.",
      [{ text: "Abrir Configuración", onPress: () => Linking.openSettings() }, { text: "Cancelar" }]
    );
  }

  // 4. Iniciar el monitoreo
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Highest,
    timeInterval: 10000, // Cada 10 segundos
    distanceInterval: 2,  // Cada 20 metros
    showsBackgroundLocationIndicator: true, // (Requerido en iOS) Muestra un indicador azul
    foregroundService: {
        notificationTitle: "Parking LP",
        notificationBody: "Estamos monitoreando tu ubicación para las alertas de estacionamiento."
    }
  });
  console.log('Servicio de ubicación en segundo plano iniciado.');
  return true;
};