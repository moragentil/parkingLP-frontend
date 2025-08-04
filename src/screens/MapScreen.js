import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import tw from '../utils/tailwind';
import sharedStyles from '../utils/sharedStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ZonasMapView from '../components/ZonasMapView';
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
        console.log('🗺️ Zonas leyenda cargadas:', response.data.leyenda.length);
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
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Se necesita acceso a la ubicación para mostrar el mapa');
        return;
      }

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

  // Copia la función de ZonasMapView
  const getColorFromHex = (hexColor, alpha = 0.3) => {
    if (!hexColor) return `rgba(200,200,200,${alpha})`; // fallback gris
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getStrokeColorFromHex = (hexColor) => {
    if (!hexColor) return 'rgb(80,80,80)';
    const hex = hexColor.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 40);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 40);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 40);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getZoneBackgroundColor = (zona) => {
    if (zona.es_prohibido_estacionar) {
      return { backgroundColor: 'rgba(120,120,120,0.3)' }; // gris translúcido
    }
    // Si tiene color_mapa, usarlo
    if (zona.color_mapa) {
      return { backgroundColor: getColorFromHex(zona.color_mapa, 0.3) };
    }
    // Fallbacks por nombre/tipo
    const nombreLower = zona.nombre.toLowerCase();
    if (nombreLower.includes('prohibida')) {
      return { backgroundColor: 'rgba(120,120,120,0.3)' };
    }
    switch (zona.tipo) {
      case 'paga':
        return { backgroundColor: 'rgba(0,200,0,0.2)' };
      case 'libre':
        return { backgroundColor: 'rgba(0,120,255,0.2)' };
      case 'prohibida':
        return { backgroundColor: 'rgba(120,120,120,0.3)' };
      default:
        return { backgroundColor: 'rgba(220,220,220,0.2)' };
    }
  };

  const getZoneTextColor = (zona) => {
    if (zona.es_prohibido_estacionar) {
      return { color: 'rgb(80,80,80)' };
    }

    // Si tiene color_mapa, usar el color del borde del polígono
    if (zona.color_mapa) {
      return { color: getStrokeColorFromHex(zona.color_mapa) };
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

  // ✅ Nueva función para procesar horarios_por_dia
  const formatearHorariosParaMostrar = (horariosPorDia) => {
    if (!horariosPorDia || Object.keys(horariosPorDia).length === 0) {
      return ['Sin horarios'];
    }
    
    console.log('🗺️ Procesando horarios por día:', horariosPorDia);
    
    const horariosFormateados = [];
    
    // Procesar Lunes a Viernes
    const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const horariosLV = [];
    
    diasSemana.forEach(dia => {
      if (horariosPorDia[dia]) {
        const horario = horariosPorDia[dia];
        const horaInicio = horario.hora_inicio.substring(0, 5); // Solo HH:MM
        const horaFin = horario.hora_fin.substring(0, 5);
        horariosLV.push(`${horaInicio} - ${horaFin}`);
      }
    });
    
    // Verificar si todos los horarios de L-V son iguales
    if (horariosLV.length > 0) {
      const horariosUnicos = [...new Set(horariosLV)];
      if (horariosUnicos.length === 1) {
        // Todos iguales
        horariosFormateados.push(`Lun-Vie ${horariosUnicos[0]}`);
      } else {
        // Diferentes horarios
        horariosFormateados.push(`Lun-Vie ${horariosUnicos.join(', ')}`);
      }
    }
    
    // Procesar Sábado
    if (horariosPorDia.sabado) {
      const sabado = horariosPorDia.sabado;
      const horaInicio = sabado.hora_inicio.substring(0, 5);
      const horaFin = sabado.hora_fin.substring(0, 5);
      horariosFormateados.push(`Sáb ${horaInicio} - ${horaFin}`);
    }
    
    // Procesar Domingo
    if (horariosPorDia.domingo) {
      const domingo = horariosPorDia.domingo;
      const horaInicio = domingo.hora_inicio.substring(0, 5);
      const horaFin = domingo.hora_fin.substring(0, 5);
      horariosFormateados.push(`Dom ${horaInicio} - ${horaFin}`);
    }
    
    console.log('🗺️ Horarios formateados:', horariosFormateados);
    return horariosFormateados.length > 0 ? horariosFormateados : ['Sin horarios'];
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
    // ✅ Log para debug específico de cada zona
    console.log(`🗺️ Renderizando zona: ${zona.nombre}`);
    console.log(`🗺️ Horarios por día:`, zona.horarios_por_dia);

    if (zona.es_prohibido_estacionar) {
      return (
        <View key={zona.id} style={tw`flex-row p-3 items-center rounded-lg w-full h-12 bg-gray-300 mb-1`}>
          <Text style={tw`text-gray-800 font-medium`}>Prohibido Estacionar</Text>
        </View>
      );
    }

    const bgColorStyle = getZoneBackgroundColor(zona);
    const textColorStyle = getZoneTextColor(zona);
    const horariosFormateados = formatearHorariosParaMostrar(zona.horarios_por_dia); // ✅ Usar horarios_por_dia

    return (
      <View key={zona.id} style={[tw`flex-row p-2 h-12 pr-2 mb-1 items-center rounded-lg w-full`, bgColorStyle]}>
        {/* Columna 1: Nombre */}
        <View style={tw`flex-1 justify-center`}>
          <Text style={[tw`font-semibold`, textColorStyle]}>{zona.nombre}</Text>
        </View>
        {/* Columna 2: Horarios, cada uno en una línea */}
        <View style={tw`flex-1 justify-center pl-2`}>
          {horariosFormateados.map((horario, index) => (
            <Text key={index} style={tw`text-gray-500 text-xs`}>
              {horario}
            </Text>
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
        {/* Mapa interactivo con zonas */}
        <View style={tw`flex items-center justify-center`}>
          <View style={[tw`h-72 w-full border rounded-xl overflow-hidden`, sharedStyles.borderColorBlue]}>
            <ZonasMapView
              style={tw`flex-1`}
              initialRegion={mapRegion}
              showUserLocation={true}
              onMapPress={onMapPress}
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
                >
                  <Ionicons name="refresh" size={20} color="blue" />
                </TouchableOpacity>
              </View>
            </ZonasMapView>
          </View>
        </View>

        {/* Leyenda de Zonas */}
        <View style={[tw`bg-white rounded-lg p-3 mt-4 shadow`]}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-gray-800 text-lg font-bold`}>Leyenda de Zonas</Text>
            {loadingZonas && (
              <ActivityIndicator size="small" color="#3236FF" />
            )}
            <Text style={tw`text-gray-600 text-sm`}>
              Tarifas: {zonasLeyenda[0]?.tarifas_formateadas}
            </Text>
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
            
          </View>
        </View>
      </View>
    </ScrollView>
  );
}