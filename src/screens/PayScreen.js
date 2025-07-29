import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import tw from '../utils/tailwind';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import sharedStyles from '../utils/sharedStyles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useZonas } from '../hooks/useZonas';
import api from '../services/api'; // ✅ Importar api para obtener tarifas

export default function PayScreen({ navigation }) {
  const [showDetails, setShowDetails] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Detectando ubicación...');
  const [zonaDetectada, setZonaDetectada] = useState(null);
  const [loadingUbicacion, setLoadingUbicacion] = useState(true);
  const [tarifasHorarias, setTarifasHorarias] = useState([]); // ✅ Estado para tarifas del backend
  const [loadingTarifas, setLoadingTarifas] = useState(true); // ✅ Estado de carga de tarifas

  const { zonas, loading: loadingZonas, cargarZonasParaMapa, buscarZonaPorUbicacion } = useZonas();

  useEffect(() => {
    getCurrentLocation();
    cargarZonasParaMapa();
    cargarTarifasHorarias(); // ✅ Cargar tarifas al inicio
  }, []);

  useEffect(() => {
    // Detectar zona cuando cambien la ubicación o las zonas
    if (location && zonas.length > 0) {
      detectarZona();
    }
  }, [location, zonas]);

  // ✅ Función para cargar tarifas horarias del backend
  const cargarTarifasHorarias = async () => {
    try {
      setLoadingTarifas(true);
      const response = await api.get('/tarifas-horarias');
      
      if (response.data.status) {
        setTarifasHorarias(response.data.tarifas);
        console.log('💰 Tarifas horarias cargadas:', response.data.tarifas);
      } else {
        console.error('Error cargando tarifas:', response.data.message);
      }
    } catch (error) {
      console.error('Error cargando tarifas horarias:', error);
    } finally {
      setLoadingTarifas(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoadingUbicacion(true);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Se necesita acceso a la ubicación');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;
      setLocation(currentLocation.coords);

      // Obtener dirección
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const addressString = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.city || ''}`;
        setAddress(addressString);
      }

    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      setAddress('No se pudo obtener la ubicación');
    } finally {
      setLoadingUbicacion(false);
    }
  };

  const detectarZona = () => {
    if (!location) return;
    
    const zona = buscarZonaPorUbicacion(location.latitude, location.longitude);
    setZonaDetectada(zona);
    
    if (zona) {
      console.log('🎯 PayScreen - Zona detectada:', zona.nombre);
    } else {
      console.log('❌ PayScreen - No se detectó ninguna zona');
    }
  };

  // Función para convertir hex a rgba con transparencia
  const hexToRgba = (hex, alpha = 0.1) => {
    if (!hex) return 'rgba(156, 163, 175, 0.1)';
    
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const darkenHexColor = (hex, amount = 60) => {
    if (!hex) return 'rgb(75, 85, 99)';
    
    const cleanHex = hex.replace('#', '');
    const r = Math.max(0, parseInt(cleanHex.substr(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(cleanHex.substr(2, 2), 16) - amount);
    const b = Math.max(0, parseInt(cleanHex.substr(4, 2), 16) - amount);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Función para obtener estilos dinámicos de zona
  const getZoneStyles = (zona) => {
    if (!zona) {
      return {
        bgStyle: { backgroundColor: 'rgba(156, 163, 175, 0.1)' },
        textStyle: { color: 'rgb(75, 85, 99)' },
        colorName: 'Sin zona'
      };
    }

    if (zona.es_prohibido_estacionar) {
      return {
        bgStyle: { backgroundColor: hexToRgba('#EF4444', 0.1) },
        textStyle: { color: 'rgb(153, 27, 27)' },
        colorName: 'Prohibido'
      };
    }

    return {
      bgStyle: { backgroundColor: hexToRgba(zona.color_mapa, 0.1) },
      textStyle: { color: darkenHexColor(zona.color_mapa, 60) },
      colorName: zona.nombre.split(' ')[1] || zona.nombre
    };
  };

  // Función para formatear horarios
  const formatearHorarios = (zona) => {
    if (!zona || !Array.isArray(zona.horarios_formateados)) {
      return [];
    }

    const horariosFormateados = [];
    
    zona.horarios_formateados.forEach(horario => {
      if (typeof horario === 'string') {
        if (horario.includes('Lun-Vie') || horario.includes('Lun-Vier')) {
          const soloHorario = horario.replace(/Lun-Vie[r]?:\s*/, '');
          horariosFormateados.push(`Lun-Vier: ${soloHorario}`);
        } else if (horario.includes('Sáb') || horario.includes('Sab')) {
          const soloHorario = horario.replace(/Sáb?:\s*/, '');
          horariosFormateados.push(`Sab: ${soloHorario}`);
        } else if (horario.includes('Dom')) {
          const soloHorario = horario.replace(/Dom:\s*/, '');
          horariosFormateados.push(`Dom: ${soloHorario}`);
        }
      }
    });

    return horariosFormateados;
  };

  // ✅ Función para obtener tarifa actual según la hora
  const obtenerTarifaActual = () => {
    if (tarifasHorarias.length === 0) return null;
    
    const ahora = new Date();
    const horaActual = ahora.getHours() * 100 + ahora.getMinutes(); // Formato HHMM
    
    console.log('🕐 Hora actual:', horaActual);
    
    // Buscar la tarifa que corresponde a la hora actual
    for (const tarifa of tarifasHorarias) {
      // Convertir las horas del backend a formato HHMM
      const horaInicio = new Date(tarifa.hora_inicio);
      const horaFin = new Date(tarifa.hora_fin);
      
      const inicioHHMM = horaInicio.getHours() * 100 + horaInicio.getMinutes();
      const finHHMM = horaFin.getHours() * 100 + horaFin.getMinutes();
      
      console.log(`💰 Tarifa ${tarifa.nombre}: ${inicioHHMM} - ${finHHMM} ($${tarifa.precio_por_hora})`);
      
      if (horaActual >= inicioHHMM && horaActual < finHHMM) {
        console.log(`✅ Tarifa actual encontrada: ${tarifa.nombre} - $${tarifa.precio_por_hora}`);
        return tarifa;
      }
    }
    
    console.log('❌ No se encontró tarifa para la hora actual');
    return null;
  };

  // ✅ Función para obtener todas las tarifas formateadas para mostrar
  const obtenerTarifasFormateadas = () => {
    if (tarifasHorarias.length === 0) return [];
    
    return tarifasHorarias.map(tarifa => {
      const horaInicio = new Date(tarifa.hora_inicio);
      const horaFin = new Date(tarifa.hora_fin);
      
      const inicioFormateado = `${horaInicio.getHours().toString().padStart(2, '0')}:${horaInicio.getMinutes().toString().padStart(2, '0')}`;
      const finFormateado = `${horaFin.getHours().toString().padStart(2, '0')}:${horaFin.getMinutes().toString().padStart(2, '0')}`;
      
      return {
        horario: `${inicioFormateado} - ${finFormateado}`,
        precio: `$${parseInt(tarifa.precio_por_hora)}`,
        nombre: tarifa.nombre
      };
    });
  };

  // ✅ Función para obtener costo actual usando tarifas del backend
  const obtenerCostoActual = (zona) => {
    if (!zona || zona.es_prohibido_estacionar) return '$0';
    
    const tarifaActual = obtenerTarifaActual();
    if (tarifaActual) {
      return `$${parseInt(tarifaActual.precio_por_hora)}`;
    }
    
    return '$0'; // Fuera de horario de pago
  };

  // Función para obtener estado de zona
  const obtenerEstadoZona = (zona) => {
    if (!zona) return { mensaje: 'Sin zona detectada', color: 'gray', bgColor: 'bg-gray-100' };
    
    if (zona.es_prohibido_estacionar) {
      return { 
        mensaje: 'Prohibido Estacionar', 
        color: 'red',
        bgColor: 'bg-red-100'
      };
    }

    const tarifaActual = obtenerTarifaActual();
    
    if (tarifaActual) {
      return { 
        mensaje: 'Pago Requerido', 
        color: 'red',
        bgColor: 'bg-red-100'
      };
    }

    return { 
      mensaje: 'Estacionamiento Gratuito', 
      color: 'green',
      bgColor: 'bg-green-100'
    };
  };

  const zoneStyles = getZoneStyles(zonaDetectada);
  const horariosFormateados = formatearHorarios(zonaDetectada);
  const tarifasFormateadas = obtenerTarifasFormateadas(); // ✅ Usar tarifas del backend
  const costoActual = obtenerCostoActual(zonaDetectada);
  const estadoZona = obtenerEstadoZona(zonaDetectada);

  return (
    <ScrollView style={tw`flex-1 bg-gray-200`} contentContainerStyle={tw`px-4 pb-28 pt-4`}>
      {/* Información de la zona */}
      <View style={[tw`bg-white rounded-lg p-4 shadow`]}>
        <View style={tw`flex-row items-center mb-2`}>
          <Ionicons name="information-circle-outline" size={24} color="green" />
          <Text style={tw`text-lg font-bold text-gray-800 ml-2`}>Información de la zona</Text>
        </View>
        
        <View style={tw`flex-row justify-between items-center ml-1 mb-2`}>
          <View style={tw`flex-row items-center`}>
            <MaterialIcons name="my-location" size={16} color="green" style={tw`mr-2 ml-1`} />
            <Text style={tw`text-gray-800`} numberOfLines={1}>
              {loadingUbicacion ? 'Detectando ubicación...' : address}
            </Text>
          </View>
          
          {zonaDetectada && (
            <View style={[tw`flex-row items-center rounded-full px-2`, zoneStyles.bgStyle]}>
              <FontAwesome name="circle" size={8} style={zoneStyles.textStyle} />
              <Text style={[tw`p-1 font-medium ml-1`, zoneStyles.textStyle]}>
                {zonaDetectada.es_prohibido_estacionar ? 'Prohibido' : zonaDetectada.nombre}
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
        
        <View style={tw`flex-row justify-between w-full items-center mb-1`}>
          <Text>Estado actual:</Text>
          <View style={[tw`flex-row items-center rounded-full px-2 py-1`, tw`${estadoZona.bgColor}`]}>
            <FontAwesome name="circle" size={8} color={estadoZona.color} />
            <Text style={[tw`font-medium ml-2`, estadoZona.color === 'red' ? tw`text-red-600` : tw`text-green-600`]}>
              {estadoZona.mensaje}
            </Text>
          </View>
        </View>

        {/* Botón para mostrar/ocultar detalles */}
        <TouchableOpacity
          onPress={() => setShowDetails(!showDetails)}
          style={[tw`bg-blue-500 rounded-lg py-2 px-4 mt-4`, sharedStyles.bgCustomBlue]}
        >
          <Text style={tw`text-white text-center font-bold`}>
            {showDetails ? 'Ocultar horarios y tarifas' : 'Ver horarios y tarifas'}
          </Text>
        </TouchableOpacity>

        {/* Contenedor de columnas (visible solo si showDetails es true) */}
        {showDetails && (
          <View style={tw`flex-row justify-between mt-4 mx-2`}>
            {/* Columna de horarios */}
            <View style={tw`items-start flex-1`}>
              <Text style={tw`text-gray-500 mb-2 font-semibold`}>Horarios de la zona</Text>
              {horariosFormateados.length > 0 ? (
                horariosFormateados.map((horario, index) => (
                  <Text key={index} style={tw`text-gray-700 text-sm mb-1`}>
                    {horario}
                  </Text>
                ))
              ) : (
                <Text style={tw`text-gray-500 text-sm`}>
                  {zonaDetectada ? 'Sin horarios definidos' : 'Zona no detectada'}
                </Text>
              )}
            </View>

            {/* Columna de tarifas */}
            <View style={tw`items-start flex-1 ml-4`}>
              <Text style={tw`text-gray-500 mb-2 font-semibold`}>Tarifas por hora</Text>
              {loadingTarifas ? (
                <Text style={tw`text-gray-500 text-sm`}>Cargando tarifas...</Text>
              ) : tarifasFormateadas.length > 0 ? (
                tarifasFormateadas.map((tarifa, index) => (
                  <View key={index} style={tw`mb-1`}>
                    <Text style={tw`text-green-600 font-semibold text-sm`}>
                      {tarifa.horario}: {tarifa.precio}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={tw`text-gray-500 text-sm`}>No hay tarifas disponibles</Text>
              )}
            </View>
          </View>
        )}
      </View>

      <View style={[tw`bg-white rounded-lg p-4 mt-4 shadow`]}>
        <View style={tw`flex-row items-center mb-1`}>
          <Text style={tw`mr-2`}><Ionicons name="play-outline" size={24} color="blue" /></Text>
          <Text style={tw`text-xl font-semibold`}>Iniciar Estacionamiento</Text>
        </View> 
        
        <View style={[tw`p-3 bg-blue-100 mt-2 rounded-lg`]}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={tw`text-lg font-semibold`}>Costo hora actual:</Text>
            <Text style={[tw`text-2xl font-semibold`, sharedStyles.textColorBlue]}>
              {loadingTarifas ? 'Cargando...' : costoActual}
            </Text>
          </View>
          <Text style={tw`text-gray-500 mt-2`}>
            El costo final dependerá del tiempo real de estacionamiento
          </Text>
        </View>
        
        <View style={tw`flex-row items-center justify-center mt-4`}>
          <TouchableOpacity 
            style={[
              tw`flex-row justify-center items-center mr-2 p-4 w-full rounded-lg`,
              zonaDetectada && !zonaDetectada.es_prohibido_estacionar && estadoZona.color === 'red' 
                ? sharedStyles.bgCustomGreen 
                : tw`bg-gray-400`
            ]}
            disabled={!zonaDetectada || zonaDetectada.es_prohibido_estacionar || estadoZona.color !== 'red'}
          >
            <Text style={tw`text-white text-center mr-2`}>
              <Ionicons name="open-outline" size={20} color="white" />
            </Text>
            <Text style={tw`text-white text-lg text-center font-bold`}>
              {!zonaDetectada 
                ? 'Detectando zona...'
                : zonaDetectada.es_prohibido_estacionar 
                  ? 'Prohibido estacionar'
                  : estadoZona.color === 'red'
                    ? 'Abrir App SEM y Comenzar'
                    : 'Estacionamiento gratuito'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[tw`bg-blue-100 rounded-lg p-3 mt-3 shadow`]}>
        <View style={tw`flex-row items-center`}>
          <Text style={tw`mr-1`}><Ionicons name="information-circle-outline" size={18} color="blue" /></Text>
          <View style={tw``}>
            <Text style={[tw``, sharedStyles.textColorBlue]}>Información importante</Text>
          </View>
        </View>
        <View style={tw`ml-1 mt-1`}>
          <Text style={[tw`text-xs text-blue-500`]}>- El pago se procesa a través de la App SEM oficial</Text>
          <Text style={[tw`text-xs text-blue-500`]}>- Esta app gestiona las alarmas y ubicación de tu vehículo</Text>
          <Text style={[tw`text-xs text-blue-500`]}>- Puedes finalizar el estacionamiento cuando quieras</Text>
          <Text style={[tw`text-xs text-blue-500`]}>- Se te cobrará desde el momento que inicies hasta que finalices o termine el horario</Text>
        </View>
      </View>
    </ScrollView>
  );
}