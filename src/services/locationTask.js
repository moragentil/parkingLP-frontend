import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { fetchParkingStatus } from './parkingService';

export const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error("Error en la tarea de ubicación:", error);
        return;
    }

    if (data) {
        const { locations } = data;
        const location = locations[0];
        if (location) {
            console.log("Nueva ubicación recibida:", location.coords);

            const isParkingActive = await fetchParkingStatus();
            if (!isParkingActive) {
                console.log("El estacionamiento no está activo, no se enviará notificación.");
                notificationSent = false;
                return;
            }

            const speed = location.coords.speed;
            console.log("Velocidad actual:", speed);

            const speedKmh = speed * 3.6; // Convertir m/s a km/h
            console.log("Velocidad en km/h:", speedKmh);
            console.log(`Velocidad (background): ${speedKmh.toFixed(2)} km/h`);

            if (speedKmh > 20 && !notificationSent) {
                console.log('Velocidad alta detectada. Enviando notificación...');
                await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🚗 ¿Estás en movimiento?',
                    body: 'Recordá desactivar el estacionamiento medido.',
                },
                trigger: null,
                });
                notificationSent = true;
            } else if (speedKmh < 10) { // Reseteamos si la velocidad baja considerablemente
                notificationSent = false;
            }
        }
    }

});
