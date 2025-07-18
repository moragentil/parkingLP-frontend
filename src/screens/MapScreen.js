import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import tw from '../utils/tailwind';
import Header from '../components/Header';
import Footer from '../components/Footer';
import sharedStyles from '../utils/sharedStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../services/api';

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [zonasLeyenda, setZonasLeyenda] = useState([]);
  const [loadingZonas, setLoadingZonas] = useState(true);
  const [mapRegion, setMapRegion] = useState({
    latitude: -34.9214, // La Plata por defecto
    longitude: -57.9544,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    getCurrentLocation();
    cargarZonasLeyenda();
  }, []);

  const cargarZonasLeyenda = async () => {
    try {
      setLoadingZonas(true);
      const response = await api.get('/zonas-leyenda');
      
      if (response.data.status) {
        setZonasLeyenda(response.data.leyenda);
        console.log('Zonas cargadas:', response.data.leyenda);
      } else {
        Alert.alert('Error', response.data.message || 'No se pudieron cargar las zonas');
      }
    } catch (error) {
      console.error('Error cargando zonas:', error);
      if (error.response?.status === 401) {
        Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        Alert.alert('Error', 'No se pudo conectar con el servidor');
      }
    } finally {
      setLoadingZonas(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
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

    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación');
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

  const getZoneBackgroundColor = (zona) => {
    if (zona.es_prohibido_estacionar) {
      return tw`bg-gray-300`;
    }
    
    // Usar el nombre de la zona como fallback principal
    const nombreLower = zona.nombre.toLowerCase();
    
    if (nombreLower.includes('verde')) {
      return tw`bg-green-100`;
    } else if (nombreLower.includes('rosa')) {
      return tw`bg-pink-100`;
    } else if (nombreLower.includes('azul')) {
      return tw`bg-blue-100`;
    } else if (nombreLower.includes('amarilla')) {
      return tw`bg-yellow-100`;
    } else if (nombreLower.includes('prohibida')) {
      return tw`bg-gray-300`;
    }
    
    // Fallback basado en el tipo
    switch (zona.tipo) {
      case 'paga':
        return tw`bg-green-100`;
      case 'libre':
        return tw`bg-blue-100`;
      case 'prohibida':
        return tw`bg-gray-300`;
      default:
        return tw`bg-gray-100`;
    }
  };

  const getZoneTextColor = (zona) => {
    if (zona.es_prohibido_estacionar) {
      return tw`text-gray-800`;
    }
    
    // Usar el nombre de la zona como referencia principal
    const nombreLower = zona.nombre.toLowerCase();
    
    if (nombreLower.includes('verde')) {
      return tw`text-green-700`;
    } else if (nombreLower.includes('rosa')) {
      return tw`text-pink-700`;
    } else if (nombreLower.includes('azul')) {
      return tw`text-blue-700`;
    } else if (nombreLower.includes('amarilla')) {
      return tw`text-yellow-700`;
    } else if (nombreLower.includes('prohibida')) {
      return tw`text-gray-800`;
    }
    
    // Fallback basado en el tipo
    switch (zona.tipo) {
      case 'paga':
        return tw`text-green-700`;
      case 'libre':
        return tw`text-blue-700`;
      case 'prohibida':
        return tw`text-gray-800`;
      default:
        return tw`text-gray-800`;
    }
  };

  const formatearHorariosParaMostrar = (horariosArray) => {
    if (!horariosArray || horariosArray.length === 0) {
      return ['Sin horarios'];
    }
    
    // Procesar los horarios para mostrarlos como en la imagen
    const horariosFormateados = [];
    
    horariosArray.forEach(horario => {
      if (horario.includes('Lun-Vie') || horario.includes('Lun-Vier')) {
        // Extraer solo el horario, no los días
        const soloHorario = horario.replace(/Lun-Vie[rs]?:\s*/, '');
        horariosFormateados.push(`Lun - Vier ${soloHorario}`);
      } else if (horario.includes('Sáb') || horario.includes('Sab')) {
        const soloHorario = horario.replace(/Sáb?:\s*/, '');
        horariosFormateados.push(`Sáb ${soloHorario}`);
      } else if (horario.includes('Dom')) {
        const soloHorario = horario.replace(/Dom:\s*/, '');
        horariosFormateados.push(`Dom ${soloHorario}`);
      } else {
        horariosFormateados.push(horario);
      }
    });
    
    return horariosFormateados;
  };

  const ordenarZonas = (zonas) => {
    const ordenPrioridad = {
      'verde': 1,
      'rosa': 2,
      'azul': 3,
      'amarilla': 4,
      'prohibida': 5
    };
    
    return [...zonas].sort((a, b) => {
      // Si es prohibido estacionar, va al final
      if (a.es_prohibido_estacionar && !b.es_prohibido_estacionar) return 1;
      if (!a.es_prohibido_estacionar && b.es_prohibido_estacionar) return -1;
      if (a.es_prohibido_estacionar && b.es_prohibido_estacionar) return 0;
      
      // Para zonas normales, ordenar por nombre
      const nombreA = a.nombre.toLowerCase();
      const nombreB = b.nombre.toLowerCase();
      
      let prioridadA = 999; // Por defecto al final
      let prioridadB = 999;
      
      // Buscar la prioridad basada en el nombre
      Object.keys(ordenPrioridad).forEach(color => {
        if (nombreA.includes(color)) {
          prioridadA = ordenPrioridad[color];
        }
        if (nombreB.includes(color)) {
          prioridadB = ordenPrioridad[color];
        }
      });
      
      return prioridadA - prioridadB;
    });
  };

  const renderZonaItem = (zona) => {
    if (zona.es_prohibido_estacionar) {
      return (
        <View key={zona.id} style={tw`flex-row p-3 items-center rounded-lg w-full justify-center bg-gray-300 mb-1`}>
          <Text style={tw`text-gray-800 font-medium`}>Prohibido Estacionar</Text>
        </View>
      );
    }

    const bgColorStyle = getZoneBackgroundColor(zona);
    const textColorStyle = getZoneTextColor(zona);
    const horariosFormateados = formatearHorariosParaMostrar(zona.horarios_formateados);

    return (
      <View key={zona.id} style={[tw`flex-row p-2 mb-1 items-center rounded-lg w-full justify-between`, bgColorStyle]}>
        <Text style={[tw`font-semibold flex-1`, textColorStyle]}>{zona.nombre}</Text>
        
        <View style={tw`flex-col justify-center items-center mx-2`}>
          <Text style={tw`text-gray-500 text-xs font-medium`}>{zona.tarifas_formateadas}</Text>
          <Text style={tw`text-gray-500 text-xs`}>por hora</Text>
        </View>
        
        <View style={tw`flex-col justify-center items-end flex-1`}>
          {horariosFormateados.map((horario, index) => (
            <Text key={index} style={tw`text-gray-500 text-xs text-right`}>{horario}</Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={tw`flex-1 bg-gray-200`}
      contentContainerStyle={tw`pb-20`}
      showsVerticalScrollIndicator={true}
    >
      <View style={tw`m-4`}>
        {/* Mapa interactivo */}
        <View style={tw`flex items-center justify-center`}>
          <View style={[tw`h-72 w-full border rounded-xl overflow-hidden`, sharedStyles.borderColorBlue]}>
            <MapView
              style={tw`flex-1`}
              region={mapRegion}
              onPress={onMapPress}
              showsUserLocation={true}
              showsMyLocationButton={true}
              mapType="standard"
            >
              {location && (
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title="Tu ubicación"
                  description="Ubicación actual"
                  pinColor="red"
                />
              )}
            </MapView>
            
            {/* Overlay con botón de recargar ubicación */}
            <TouchableOpacity
              style={tw`absolute top-2 right-2 bg-white rounded-full p-2 shadow`}
              onPress={getCurrentLocation}
            >
              <Ionicons name="refresh" size={20} color="blue" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Leyenda de Zonas */}
        <View style={[tw`bg-white rounded-lg p-3 mt-4 shadow`]}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-gray-800 text-lg font-bold`}>Leyenda de Zonas</Text>
            {loadingZonas && (
              <ActivityIndicator size="small" color="#3236FF" />
            )}
          </View>
          
          <View style={tw`flex-col items-center mt-2`}>
            {loadingZonas ? (
              <View style={tw`p-4`}>
                <Text style={tw`text-gray-500 text-center`}>Cargando zonas...</Text>
              </View>
            ) : zonasLeyenda.length > 0 ? (
              <>
                {ordenarZonas(zonasLeyenda).map(zona => renderZonaItem(zona))}
              </>
            ) : (
              <View style={tw`p-4`}>
                <Text style={tw`text-gray-500 text-center`}>No hay zonas disponibles</Text>
                <TouchableOpacity
                  onPress={cargarZonasLeyenda}
                  style={tw`mt-2 p-2 bg-blue-100 rounded-lg`}
                >
                  <Text style={[tw`text-sm`, sharedStyles.textColorBlue]}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Botón para recargar zonas */}
            {!loadingZonas && zonasLeyenda.length > 0 && (
              <TouchableOpacity
                onPress={cargarZonasLeyenda}
                style={tw`mt-2 p-2 bg-blue-100 rounded-lg`}
              >
                <Text style={[tw`text-sm`, sharedStyles.textColorBlue]}>Actualizar zonas</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}