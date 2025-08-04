# ParkingLP Frontend

Frontend para la gestión de zonas de estacionamiento, vehículos, usuarios y alarmas para la app ParkingLP.

> **Importante:** La rama principal para utilizar y entregar el proyecto es la rama `mora`, ya que contiene la versión final y actualizada del frontend.

## Tecnologías utilizadas

- **Framework:** React Native (Expo)
- **Lenguaje:** JavaScript (ES6+)
- **Navegación:** React Navigation
- **Mapas:** react-native-maps
- **Estilos:** Tailwind React Native Classnames
- **Gestión de estado:** React Hooks
- **Consumo de API:** Axios
- **Almacenamiento local:** AsyncStorage

## Estructura principal

- `App.js` - Punto de entrada principal
- `src/components/` - Componentes reutilizables (Header, Footer, MainLayout, ZonasMapView, etc.)
- `src/screens/` - Pantallas principales (HomeScreen, PayScreen, CarScreen, MapScreen, LoginScreen, RegisterScreen, SettingsScreen)
- `src/hooks/` - Hooks personalizados (useZonas)
- `src/services/` - Configuración de API (api.js)
- `src/utils/` - Utilidades y estilos compartidos
- `assets/` - Imágenes y recursos gráficos
- `.expo/` - Archivos de configuración de Expo

## Instalación y configuración

1. **Clonar el repositorio**
   ```sh
   git clone https://github.com/moragentil/parkingLP-frontend
   cd parkingLP-frontend
   ```

2. **Instalar dependencias**
   ```sh
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno**
   - No requiere archivo `.env` para el frontend, pero asegúrate de que la IP del backend esté correctamente configurada en [`src/services/api.js`](src/services/api.js) (`BACKEND_IP`).

4. **Levantar la app en modo desarrollo**
   ```sh
   npm start
   # o
   yarn start
   ```
   - Puedes abrir la app en tu dispositivo móvil con Expo Go, o en un emulador Android/iOS.

5. **Configurar permisos**
   - La app solicita permisos de ubicación al iniciar para mostrar el mapa y detectar zonas.

## Usuarios de prueba

- Puedes usar el usuario de prueba creado por el backend:
  - **Email:** prueba@parkinglp.com
  - **Contraseña:** password123

> Si necesitas otro usuario, puedes registrarlo desde la pantalla de registro.

## Funcionalidades principales

- **Autenticación:** Login, registro y gestión de sesión.
- **Mapa interactivo:** Visualización de zonas, ubicación actual y selección manual.
- **Gestión de vehículos:** Agregar, eliminar y seleccionar vehículos.
- **Estacionamiento:** Iniciar y finalizar estacionamiento, cálculo de tarifas y horarios.
- **Alarmas:** Notificaciones y gestión de vencimiento.
- **Tarifas variables:** Visualización y cálculo según zona y horario.

## Endpoints principales (consumidos desde el backend)

- **Autenticación:** `/api/login`, `/api/register`, `/api/logout`, `/api/me`
- **Usuarios:** `/api/usuarios`
- **Vehículos:** `/api/vehiculos`
- **Estacionamientos:** `/api/estacionamientos`
- **Zonas:** `/api/zonas`, `/api/zonas-leyenda`, `/api/zonas-mapa`
- **Alarmas:** `/api/alarmas`

> Todas las rutas protegidas requieren autenticación con token Bearer.

## Notas importantes

- El frontend está preparado para consumir el backend de ParkingLP y requiere que esté corriendo y accesible desde el dispositivo/emulador.
- La app abre la aplicación oficial SEM La Plata para completar el pago (o redirige a la tienda si no está instalada).
- El sistema soporta tarifas variables por zona y horario, y muestra información relevante en tiempo real.

## Contacto y soporte

Para dudas o soporte, contacta a moragentil@gmail.com.

---

**Entrega:** Este repositorio contiene todo lo necesario para ejecutar el frontend del proyecto ParkingLP, incluyendo configuración, componentes, pantallas y documentación.