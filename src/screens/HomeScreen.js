import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import * as Location from 'expo-location';
import tw from '../utils/tailwind';
import sharedStyles from '../utils/sharedStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MaterialIcons } from '@expo/vector-icons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ZonasMapView from '../components/ZonasMapView';
import { useZonas } from '../hooks/useZonas';
import api from '../services/api';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Detectando ubicación...');
  const [zonaDetectada, setZonaDetectada] = useState(null);
  const [loadingUbicacion, setLoadingUbicacion] = useState(true);
  const [mapRegion, setMapRegion] = useState({
    latitude: -34.9214, // La Plata por defecto
    longitude: -57.9544,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [estacionamientoActivo, setEstacionamientoActivo] = useState(null);
  const [ubicacionManual, setUbicacionManual] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapModalRegion, setMapModalRegion] = useState(null);

  const { zonas, loading: loadingZonas, cargarZonasParaMapa, buscarZonaPorUbicacion } = useZonas();

  useEffect(() => {
    getCurrentLocation();
    cargarZonasParaMapa();
    verificarEstacionamientoActivo();
  }, []);

  useEffect(() => {
    // Detectar zona cuando cambien la ubicación o las zonas
    if (location && zonas.length > 0) {
      detectarZona();
    }
  }, [location, zonas]);

  const getCurrentLocation = async () => {
    try {
      setLoadingUbicacion(true);
      setUbicacionManual(false);
      
      // Pedir permisos de ubicación
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Se necesita acceso a la ubicación para mostrar el mapa');
        return;
      }

      // Obtener ubicación actual
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;
      
      setLocation(currentLocation.coords);
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Obtener dirección a partir de coordenadas
/*       let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const addressString = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.city || ''}`;
        setAddress(addressString);
      } */

      obtenerDireccion(latitude, longitude);

    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación');
      setAddress('No se pudo obtener la ubicación');
      setUbicacionManual(false);
    } finally {
      setLoadingUbicacion(false);
    }
  };

   const obtenerDireccion = async (latitude, longitude) => {
    try {
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const addressString = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.city || ''}`;
        setAddress(addressString);
      } else {
        setAddress('Ubicación seleccionada');
      }
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      setAddress('Ubicación seleccionada');
    }
  };


  const detectarZona = () => {
    if (!location) return;
    
    const zona = buscarZonaPorUbicacion(location.latitude, location.longitude);
    setZonaDetectada(zona);
    
    if (zona) {
      console.log('Zona detectada:', zona.nombre, 'Color:', zona.color_mapa);
      console.log('Horarios completos de la zona detectada:', zona.horarios_formateados);
      console.log('Tipo de horarios_formateados:', typeof zona.horarios_formateados);
    } else {
      console.log('No se detectó ninguna zona');
    }
  };

  const onMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
    setMapRegion({
      ...mapRegion,
      latitude,
      longitude,
    });
  };

   const handleManualLocationSelect = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
    obtenerDireccion(latitude, longitude);
    setUbicacionManual(true);
    setShowMapModal(false);
    
    setMapRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    // Guardar en AsyncStorage
    await AsyncStorage.setItem('ubicacionManual', JSON.stringify({ latitude, longitude }));
  };

    const openManualLocationPicker = () => {
    setMapModalRegion(mapRegion);
    setShowMapModal(true);
  };

  // Función para convertir hex a rgba con transparencia
  const hexToRgba = (hex, alpha = 0.1) => {
    if (!hex) return 'rgba(156, 163, 175, 0.1)'; // gray-400 por defecto
    
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Función para convertir hex a rgb sin transparencia
  const hexToRgb = (hex) => {
    if (!hex) return 'rgb(75, 85, 99)'; // gray-600 por defecto
    
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Función para crear color más oscuro para el borde
  const darkenHexColor = (hex, amount = 40) => {
    if (!hex) return 'rgb(75, 85, 99)'; // gray-600 por defecto
    
    const cleanHex = hex.replace('#', '');
    const r = Math.max(0, parseInt(cleanHex.substr(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(cleanHex.substr(2, 2), 16) - amount);
    const b = Math.max(0, parseInt(cleanHex.substr(4, 2), 16) - amount);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Función para obtener los estilos dinámicos basados en color_mapa del backend
  const getZoneStylesFromBackend = (zona) => {
    if (!zona) {
      return { 
        borderStyle: { borderLeftColor: 'rgb(156, 163, 175)' }, // gray-400
        iconColor: 'rgb(75, 85, 99)', // gray-600
        bgStyle: { backgroundColor: hexToRgba('#9CA3AF', 0.1) }, // gray-400
        textStyle: { color: 'rgb(75, 85, 99)' }, // gray-600
        colorName: 'Sin zona'
      };
    }

    if (zona.es_prohibido_estacionar) {
      return {
        borderStyle: { borderLeftColor: 'rgb(239, 68, 68)' }, // red-500
        iconColor: 'rgb(239, 68, 68)', // red-500
        bgStyle: { backgroundColor: hexToRgba('#EF4444', 0.1) }, // red-500
        textStyle: { color: 'rgb(153, 27, 27)' }, // red-800
        colorName: 'Prohibido'
      };
    }

    // Usar el color_mapa del backend
    const borderColor = darkenHexColor(zona.color_mapa, 20);
    const iconColor = darkenHexColor(zona.color_mapa, 30);
    const bgColor = hexToRgba(zona.color_mapa, 0.1);
    const textColor = darkenHexColor(zona.color_mapa, 60);

    return {
      borderStyle: { borderLeftColor: borderColor },
      iconColor: iconColor,
      bgStyle: { backgroundColor: bgColor },
      textStyle: { color: textColor },
      colorName: zona.nombre.split(' ')[1] || zona.nombre // Extraer el color del nombre (ej: "Zona Verde" -> "Verde")
    };
  };

  // ✅ Función corregida para procesar horarios del backend
  const formatearHorariosZona = (zona) => {
    console.log('Procesando zona para horarios:', zona?.nombre);
    console.log('Horarios raw:', zona?.horarios_formateados);
    
    if (!zona) {
      console.log('No hay zona');
      return { lunesViernes: 'Sin horarios', sabados: 'Sin horarios' };
    }

    // Verificar si horarios_formateados existe y es un array o un objeto
    let horariosArray = zona.horarios_formateados;
    
    // Si es un objeto, convertir a array los valores
    if (horariosArray && typeof horariosArray === 'object' && !Array.isArray(horariosArray)) {
      horariosArray = Object.values(horariosArray);
    }
    
    // Si no es array, intentar crear uno
    if (!Array.isArray(horariosArray)) {
      console.log('horarios_formateados no es un array:', typeof horariosArray);
      return { lunesViernes: 'Sin horarios', sabados: 'Sin horarios' };
    }

    let lunesViernes = 'Sin horarios';
    let sabados = 'Sin horarios';

    console.log('Procesando array de horarios:', horariosArray);

    // Procesar cada elemento del array de horarios
    horariosArray.forEach((horario, index) => {
      console.log(`Procesando horario ${index}:`, horario);
      
      if (typeof horario === 'string') {
        if (horario.includes('Lun-Vie:') || horario.includes('Lun-Vier:')) {
          // Extraer solo el horario después de "Lun-Vie: " o "Lun-Vier: "
          lunesViernes = horario.replace(/Lun-Vie[r]?:\s*/, '');
          console.log('Horario lun-vie encontrado:', lunesViernes);
        } else if (horario.includes('Sáb:') || horario.includes('Sab:')) {
          // Extraer solo el horario después de "Sáb: "
          sabados = horario.replace(/Sáb?:\s*/, '');
          console.log('Horario sábado encontrado:', sabados);
        }
      }
    });

    const resultado = { lunesViernes, sabados };
    console.log('Resultado final de horarios:', resultado);
    
    return resultado;
  };

  const obtenerEstadoZona = (zona) => {
    if (!zona) return { mensaje: 'Sin zona detectada', esActiva: false };
    
    if (zona.es_prohibido_estacionar) {
      return { mensaje: 'Prohibido estacionar', esActiva: false };
    }

    const ahora = new Date();
    const horaActual = ahora.getHours();
    const diaSemana = ahora.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado

    // Lógica simple para determinar si se requiere pago
    // Esto debería ser más complejo basado en los horarios reales de la zona
    if (diaSemana >= 1 && diaSemana <= 5) { // Lunes a viernes
      if (horaActual >= 7 && horaActual < 20) {
        return { mensaje: `Pago requerido hasta las 20:00 hs`, esActiva: true };
      }
    } else if (diaSemana === 6) { // Sábado
      if (horaActual >= 9 && horaActual < 20) {
        return { mensaje: `Pago requerido hasta las 20:00 hs`, esActiva: true };
      }
    }

    return { mensaje: 'Estacionamiento gratuito', esActiva: false };
  };

  const zoneStyles = getZoneStylesFromBackend(zonaDetectada);
  const horarios = formatearHorariosZona(zonaDetectada);
  const estadoZona = obtenerEstadoZona(zonaDetectada);

  const verificarEstacionamientoActivo = async () => {
      try {
        const response = await api.get('/estacionamiento-activo');
        
        // El backend devuelve status:true si hay uno activo
        if (response.data.status && response.data.estacionamiento) {
          setEstacionamientoActivo(response.data.estacionamiento);
          return response.data.estacionamiento;
        }
        
        // Si no, devuelve null
        setEstacionamientoActivo(null);
        return null;
      } catch (error) {
        // No es un error crítico si la respuesta es 404 (no encontrado)
        if (error.response?.status !== 404) {
          console.error('Error verificando estacionamiento activo:', error);
        }
        setEstacionamientoActivo(null);
        return null;
      }
    };

  return (
    <View style={tw`flex-1 m-4 bg-gray-200`} >
      {/* Mapa interactivo con zonas */}
      <View style={tw`flex items-center justify-center`} >
        <View style={[tw`h-44 w-full border rounded-xl overflow-hidden`, sharedStyles.borderColorBlue]}>
          <ZonasMapView
            style={tw`flex-1`}
            initialRegion={mapRegion}
            showUserLocation={!ubicacionManual}
            onMapPress={onMapPress}
            zonas={zonas} // ✅ Pasar las zonas como prop
            loading={loadingZonas} // ✅ Pasar el estado de carga
          >
            {/* Botón de refresh ubicación */}
            <View style={{
              position: 'absolute',
              top: 10,
              right: 10,
            }}>
              <TouchableOpacity
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  padding: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
                onPress={getCurrentLocation}
                disabled={loadingUbicacion}
              >
                {loadingUbicacion ? (
                  <ActivityIndicator size="small" color="blue" />
                ) : (
                  <Ionicons name="refresh" size={20} color="blue" />
                )}
              </TouchableOpacity>
            </View>
                        {/* Marcador para ubicación manual */}
            {ubicacionManual && location && (
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                pinColor="blue"
              />
            )}
          </ZonasMapView>
        </View>
      </View>

      {/* Ubicación detectada */}
      <View style={[tw`bg-white rounded-lg p-4 mt-4 shadow border-l-4`, sharedStyles.borderColorBlue]}>
        <View style={tw`flex-row items-center mb-3`}>
          <Ionicons name="location-outline" size={24} color="blue" />
          <Text style={tw`text-lg font-bold text-gray-800 ml-2`}>Ubicación detectada</Text>
        </View>
        <View style={tw`flex-row items-center ml-1 mb-3`}>
          <MaterialIcons name="my-location" size={16} color="green" style={tw`mr-2 ml-1`} />
          <Text style={tw`text-gray-800 ml-2 flex-1`}>{address}</Text>
        </View>
        <View style={tw`flex-row items-center mx-2`}>
          <Text style={tw`text-gray-500`}>
            {loadingUbicacion ? 'Detectando ubicación...' : 
             location ? (ubicacionManual ? 'Seleccionada manualmente' : 'Detectado automáticamente') : 'Ubicación no disponible'}
          </Text>
        </View>
        {/* Botón para selección manual cuando falla la detección automática */}
        {!location && !loadingUbicacion && (
          <TouchableOpacity
            style={[tw`mt-2 p-2 rounded-lg flex-row items-center justify-center`, sharedStyles.bgCustomBlue]}
            onPress={openManualLocationPicker}
          >
            <Ionicons name="map-outline" size={18} color="white" />
            <Text style={tw`text-white ml-2`}>Seleccionar ubicación manualmente</Text>
          </TouchableOpacity>
        )}
      </View>

            {/* Modal para selección manual de ubicación */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        transparent={false}
      >
        <View style={tw`flex-1`}>
          <View style={tw`h-12 bg-blue-500 flex-row items-center px-4`}>
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={tw`text-white text-lg font-bold ml-4`}>Seleccione su ubicación</Text>
          </View>
          
          <View style={tw`flex-1`}>
            <ZonasMapView
              style={tw`flex-1`}
              initialRegion={mapModalRegion || mapRegion}
              showUserLocation={false}
              onMapPress={handleManualLocationSelect}
              zonas={zonas}
              loading={loadingZonas}
            >
              {location && (
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  pinColor="blue"
                />
              )}
            </ZonasMapView>
          </View>
          
          <View style={tw`p-4 bg-white`}>
            <Text style={tw`text-center text-gray-600 mb-2`}>
              Toque en el mapa para seleccionar su ubicación
            </Text>
            <TouchableOpacity
              style={[tw`p-3 rounded-lg`, sharedStyles.bgCustomBlue]}
              onPress={() => setShowMapModal(false)}
            >
              <Text style={tw`text-white text-center font-bold`}>Confirmar ubicación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Zona detectada - Dinámico con colores del backend */}
      <View style={[
        tw`bg-white rounded-lg p-4 mt-4 shadow border-l-4`,
        zoneStyles.borderStyle
      ]}>
        <View style={tw`flex-row justify-between items-center ml-1 mb-3`}>
          <View style={tw`flex-row items-center`}>
            <Ionicons 
              name="map-outline" 
              size={22} 
              color={zoneStyles.iconColor}
            />
            <Text style={tw`text-gray-800 ml-2 text-lg font-bold`}>
              {loadingZonas ? 'Detectando zona...' : 'Zona detectada'}
            </Text>
          </View>
          
          {zonaDetectada && (
            <View style={[tw`flex-row items-center rounded-full px-2`, zoneStyles.bgStyle]}>
              <FontAwesome name="circle" size={8} style={zoneStyles.textStyle} />
              <Text style={[tw`p-1 font-medium ml-1`, zoneStyles.textStyle]}>
                {zonaDetectada.es_prohibido_estacionar ? 'Prohibido' : `${zonaDetectada.nombre}`}
              </Text>
            </View>
          )}
          
          {!zonaDetectada && !loadingZonas && (
            <View style={tw`flex-row items-center bg-gray-100 rounded-full px-2`}>
              <FontAwesome name="circle" size={8} style={tw`text-gray-600`} />
              <Text style={tw`p-1 font-medium ml-1 text-gray-600`}>Sin zona</Text>
            </View>
          )}
        </View>

        {loadingZonas ? (
          <View style={tw`flex-row justify-center items-center py-4`}>
            <ActivityIndicator size="small" color="#3236FF" />
            <Text style={tw`ml-2 text-gray-500`}>Cargando información de zona...</Text>
          </View>
        ) : zonaDetectada && !zonaDetectada.es_prohibido_estacionar ? (
          <>
            <View style={tw`flex-row items-center mx-4 mt-1 justify-between`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="time-outline" size={20} style={tw`text-gray-800 mr-1`} />
                <View style={tw`flex-col ml-1`}>
                  <Text style={tw`text-gray-500`}>Lun-Vier:</Text>
                  <Text style={tw`text-gray-800`}>{horarios.lunesViernes}</Text>
                </View>
              </View>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="time-outline" size={20} style={tw`text-gray-800 mr-1`} />
                <View style={tw`flex-col ml-1`}>
                  <Text style={tw`text-gray-500`}>Sábados:</Text>
                  <Text style={tw`text-gray-800`}>{horarios.sabados}</Text>
                </View>
              </View>
            </View>
            <View style={tw`flex-row items-center w-full mt-2 justify-center`}>
              <Text style={[
                tw`text-sm mx-4 mt-2 font-medium p-1 px-4 rounded-full`,
                estadoZona.esActiva ? [tw``, zoneStyles.bgStyle, zoneStyles.textStyle] : tw`bg-gray-100 text-gray-600`
              ]}>
                {estadoZona.mensaje}
              </Text>
            </View>
          </>
        ) : zonaDetectada && zonaDetectada.es_prohibido_estacionar ? (
          <View style={tw`flex-row items-center w-full mt-2 justify-center`}>
            <Text style={tw`text-sm mx-4 mt-2 font-medium p-1 px-4 rounded-full bg-red-100 text-red-600`}>
              Prohibido estacionar en esta zona
            </Text>
          </View>
        ) : (
          <View style={tw`flex-row items-center w-full mt-2 justify-center`}>
            <Text style={tw`text-sm mx-4 mt-2 font-medium p-1 px-4 rounded-full bg-gray-100 text-gray-600`}>
              No estás en una zona de estacionamiento regulado
            </Text>
          </View>
        )}
      </View>

      {/* Estado del estacionamiento */}
      <View
        style={[
          tw`flex-row justify-center items-center rounded-lg p-2 mt-4 shadow ${estacionamientoActivo ? 'border border-red-500' : 'border border-gray-400'}`,
          estacionamientoActivo ? tw`bg-red-200` : tw`bg-gray-300`
        ]}
      >
        <Ionicons name="information-circle-outline" size={24} style={tw`text-gray-800 ${estacionamientoActivo ? 'text-red-600' : 'text-gray-600'}`} />
        <Text style={tw`ml-1 text-gray-800 text-base font-semibold ${estacionamientoActivo ? 'text-red-600' : 'text-gray-600'}`}>
          {estacionamientoActivo ? `Estacionamiento activo:` : 'Sin estacionamiento activo'}
        </Text>
      </View>


      {/* Botones */}
      { !estacionamientoActivo && (
      <View style={tw`flex-row justify-between mr-2 mt-4`}>
        <TouchableOpacity 
          style={[tw`mr-2 p-4 w-1/2 rounded-lg`, sharedStyles.bgCustomBlue]}
          onPress={() => navigation.navigate('Pay')}
        >
          <Text style={tw`text-white text-center font-bold`}>Pagar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[tw`p-4 w-1/2 rounded-lg`, sharedStyles.bgCustomBlue]}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={tw`text-white text-center font-bold`}>Zona Límite</Text>
        </TouchableOpacity>
      </View>
      )}
      {estacionamientoActivo && (
        <View style={tw`flex-row w-full mt-4`}>
          <TouchableOpacity 
            style={[tw` w-full p-4 rounded-lg bg-red-500`]}
            onPress={() => navigation.navigate('Pay')}
          >
            <Text style={tw`text-white text-center font-bold`}>Finalizar Estacionamiento</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}