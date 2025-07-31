import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking, Platform, Modal, FlatList, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import tw from '../utils/tailwind';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import sharedStyles from '../utils/sharedStyles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useZonas } from '../hooks/useZonas';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PayScreen({ navigation }) {
  const [showDetails, setShowDetails] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Detectando ubicación...');
  const [zonaDetectada, setZonaDetectada] = useState(null);
  const [loadingUbicacion, setLoadingUbicacion] = useState(true);
  const [tarifasHorarias, setTarifasHorarias] = useState([]);
  const [loadingTarifas, setLoadingTarifas] = useState(true);
  const [estacionamientoActivo, setEstacionamientoActivo] = useState(null);

  // ✅ Estados para el selector de vehículos
  const [vehiculos, setVehiculos] = useState([]);
  const [cargandoVehiculos, setCargandoVehiculos] = useState(false);
  const [selectorVehiculoVisible, setSelectorVehiculoVisible] = useState(false);

  const { zonas, loading: loadingZonas, cargarZonasParaMapa, buscarZonaPorUbicacion } = useZonas();

  // ✅ Función para verificar si ya hay un estacionamiento activo
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

  // ✅ Función para finalizar el estacionamiento activo
  const finalizarEstacionamientoBackend = async () => {
    if (!estacionamientoActivo) return;
    
    try {
      console.log('🚗 Finalizando estacionamiento activo:', estacionamientoActivo.id);
      
      const response = await api.post(`/estacionamientos/${estacionamientoActivo.id}/finalizar`);
      
      if (response.data.status) {
        console.log('✅ Estacionamiento finalizado exitosamente');
        setEstacionamientoActivo(null);
        
        // Opcional: Abrir app SEM después de finalizar
        await abrirAppSEMRealMejorada();
        
        Alert.alert(
          'Estacionamiento Finalizado',
          'Tu estacionamiento ha sido finalizado correctamente.',
          [{ text: 'OK' }]
        );
      } else {
        console.log('❌ Error finalizando estacionamiento:', response.data.message);
        Alert.alert('Error', response.data.message || 'No se pudo finalizar el estacionamiento');
      }
    } catch (error) {
      console.error('❌ Error en finalizarEstacionamientoBackend:', error);
      
      if (error.response?.status === 404) {
        Alert.alert('No encontrado', 'El estacionamiento activo no fue encontrado');
      } else {
        Alert.alert('Error de conexión', 'No se pudo conectar con el servidor');
      }
    }
  };

  // ✅ Función para abrir la app SEM con mejor UX
  const abrirAppSEMRealMejorada = async () => {
    try {
      let appUrl, storeUrl;

      if (Platform.OS === 'android') {
        const androidPackage = 'ar.edu.unlp.semmobile.laplata';
        appUrl = `intent://launch#Intent;package=${androidPackage};end`;
        storeUrl = `https://play.google.com/store/apps/details?id=${androidPackage}`;
      } else {
        appUrl = 'semmobile://';
        storeUrl = 'https://apps.apple.com/app/sem-mobile/id1387705895';
      }

      const canOpen = await Linking.canOpenURL(appUrl);
      
      if (canOpen) {
        await Linking.openURL(appUrl);
        return true;
      } else {
        return new Promise((resolve) => {
          Alert.alert(
            'App SEM requerida',
            'Para completar el pago necesitas la app oficial SEM La Plata.',
            [
              { text: 'Continuar sin app', style: 'cancel', onPress: () => resolve(false) },
              {
                text: 'Descargar SEM',
                onPress: async () => {
                  try {
                    await Linking.openURL(storeUrl);
                    resolve(true);
                  } catch (error) {
                    Alert.alert('Error', 'No se pudo abrir la tienda de aplicaciones.');
                    resolve(false);
                  }
                },
              },
            ]
          );
        });
      }
    } catch (error) {
      console.error('Error abriendo app SEM:', error);
      Alert.alert('Error', 'No se pudo verificar la aplicación SEM.');
      return false;
    }
  };

  useEffect(() => {
    const cargarUbicacionManual = async () => {
      const ubicacionManual = await AsyncStorage.getItem('ubicacionManual');
      const direccionManual = await AsyncStorage.getItem('direccionManual');
      if (ubicacionManual) {
        const coords = JSON.parse(ubicacionManual);
        setLocation(coords);
        setLoadingUbicacion(false);
        setAddress(direccionManual || 'Dirección no disponible'); // <--- Aquí se muestra la misma dirección
        // Detectar zona con esos coords
        const zona = buscarZonaPorUbicacion(coords.latitude, coords.longitude);
        setZonaDetectada(zona);
      } else {
        getCurrentLocation();
      }
    };
    cargarUbicacionManual();
    cargarZonasParaMapa();
    cargarTarifasHorarias();
    verificarEstacionamientoActivo();
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

  // ✅ Función para iniciar estacionamiento en el backend (ahora recibe vehiculoId)
  const iniciarEstacionamientoBackend = async (vehiculoId) => {
    try {
      // Validaciones previas
      if (!location || !zonaDetectada || !vehiculoId) {
        Alert.alert('Error', 'Faltan datos para iniciar el estacionamiento (ubicación, zona o vehículo).');
        return null;
      }

      console.log('🚗 Iniciando proceso de estacionamiento...');
      console.log('Zona detectada', zonaDetectada);
      
      // Preparar datos para el backend
      const datosEstacionamiento = {
        vehiculo_id: vehiculoId,
        latitud: location.latitude,
        longitud: location.longitude,
        direccion: address || 'Dirección no disponible',
        zona_id: zonaDetectada.id // ← Agrega el id de la zona detectada
      };

      console.log('📡 Enviando datos de estacionamiento:', datosEstacionamiento);

      // Llamar al backend
      const response = await api.post('/estacionamientos', datosEstacionamiento);
      
      if (response.data.status) {
        console.log('✅ Respuesta exitosa del backend:', response.data.message);
        setEstacionamientoActivo(response.data.estacionamiento);
        return response.data.estacionamiento;
      } else {
        console.log('❌ Error en respuesta del backend:', response.data.message);
        Alert.alert('Error', response.data.message || 'No se pudo iniciar el estacionamiento');
        return null;
      }
    } catch (error) {
      console.error('❌ Error en iniciarEstacionamientoBackend:', error);
      
      if (error.response?.status === 409) {
        Alert.alert('Estacionamiento activo', 'Ya tienes un estacionamiento activo.');
      } else {
        Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
      }
      return null;
    }
  };

  // ✅ Nueva función para cargar vehículos del usuario
  const cargarVehiculos = async () => {
    setCargandoVehiculos(true);
    try {
      const response = await api.get('/vehiculos');
      if (response.data.status && response.data.vehiculos.length > 0) {
        setVehiculos(response.data.vehiculos);
        return response.data.vehiculos;
      } else {
        setVehiculos([]);
        return [];
      }
    } catch (error) {
      console.error("Error cargando vehículos:", error);
      Alert.alert('Error', 'No se pudo obtener tu lista de vehículos.');
      return null;
    } finally {
      setCargandoVehiculos(false);
    }
  };

  // ✅ Nueva función que se ejecuta al seleccionar un vehículo del modal
  const handleSeleccionarVehiculo = (vehiculo) => {
    setSelectorVehiculoVisible(false);
    
    // Ahora que tenemos el vehículo, mostramos la confirmación final
    Alert.alert(
      'Confirmar Estacionamiento',
      `¿Iniciar estacionamiento para el vehículo ${vehiculo.patente} en ${zonaDetectada?.nombre || 'esta zona'}?\n\nCosto actual: ${costoActual} por hora`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar y Abrir SEM',
          onPress: async () => {
            const estacionamiento = await iniciarEstacionamientoBackend(vehiculo.id);
            if (estacionamiento) {
              // Si se requiere pago, intentar abrir la app SEM
              if (estacionamiento.requiere_pago) {
                await abrirAppSEMRealMejorada(); // Usando la función que ya tenías
              }
              Alert.alert(
                'Estacionamiento Iniciado',
                'Tu estacionamiento se ha registrado correctamente.',
                [{ text: 'Ver mi Estacionamiento', onPress: () => navigation.navigate('Car') }, { text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  // ✅ Función PRINCIPAL MODIFICADA: Ahora abre el selector de vehículo
  const iniciarEstacionamientoYAbrirSEM = async () => {
    try {
      // Paso 1: Cargar vehículos del usuario
      const vehiculosDisponibles = await cargarVehiculos();

      if (vehiculosDisponibles === null) return; // Hubo un error al cargar

      if (vehiculosDisponibles.length === 0) {
        Alert.alert(
          'Sin Vehículo Registrado',
          'Necesitas agregar un vehículo antes de poder estacionar.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Agregar Vehículo', onPress: () => navigation.navigate('Car') }
          ]
        );
        return;
      }

      // Paso 2: Mostrar el modal para seleccionar el vehículo
      setSelectorVehiculoVisible(true);

    } catch (error) {
      console.error('❌ Error en el proceso de inicio:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta nuevamente.');
    }
  };

  // ✅ useEffect mejorado para verificar estacionamiento activo al cargar la pantalla
  useEffect(() => {
    const verificarEstacionamientoAlCargar = async () => {
      try {
        const estacionamiento = await verificarEstacionamientoActivo();
        
        if (estacionamiento) {
          console.log('⚠️ Usuario tiene estacionamiento activo:', {
            id: estacionamiento.id,
            direccion: estacionamiento.direccion || 'Ubicación no disponible',
            fecha_inicio: estacionamiento.fecha_inicio,
            hora_inicio: estacionamiento.hora_inicio,
            zona: estacionamiento.zona?.nombre || 'Zona no especificada'
          });
        } else {
          console.log('ℹ️ No hay estacionamiento activo');
        }
      } catch (error) {
        console.log('ℹ️ Error verificando estacionamiento activo:', error.message);
        // No mostrar error al usuario, es solo verificación de fondo
      }
    };

    verificarEstacionamientoAlCargar();
  }, []);

  const zoneStyles = getZoneStyles(zonaDetectada);
  const horariosFormateados = formatearHorarios(zonaDetectada);
  const tarifasFormateadas = obtenerTarifasFormateadas();
  const costoActual = obtenerCostoActual(zonaDetectada);
  const estadoZona = obtenerEstadoZona(zonaDetectada);

  return (
    <ScrollView style={tw`flex-1 bg-gray-200`} contentContainerStyle={tw`px-4 pb-28 pt-4`}>
      {/* Información de la zona */}
      <View style={[tw`bg-white rounded-lg py-4 px-3 shadow`]}>
        <View style={tw`flex-row items-center mb-2`}>
          <Ionicons name="information-circle-outline" size={24} style={zoneStyles.textStyle} />
          <Text style={tw`text-lg font-bold text-gray-800 ml-2`}>Información de la zona</Text>
        </View>
        
        <View style={tw`flex-row justify-between items-center ml-1 mb-2`}>
          <View style={tw`flex-row items-center`}>
            <MaterialIcons name="my-location" size={16} style={zoneStyles.textStyle} />
            <Text style={tw`text-gray-800 ml-2`} numberOfLines={1}>
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
          <View style={tw`flex-row justify-between mt-4 `}>
            {/* Columna de horarios */}
            <View style={tw`items-start flex-1`}>
              <Text style={tw`text-gray-500 mb-2 font-semibold`}>Horarios de la zona</Text>
              {horariosFormateados.length > 0 ? (
                horariosFormateados.map((horario, index) => (
                  <Text key={index} style={tw`text-gray-700 font-semibold text-sm mb-1`}>
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
                    <Text style={[tw`font-semibold text-sm`, zoneStyles.textStyle]}>
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
        {/* Cambiamos el título según si hay estacionamiento activo */}
        <View style={tw`flex-row items-center mb-1`}>
          <Text style={tw`mr-2`}>
            <Ionicons 
              name={estacionamientoActivo ? "stop-outline" : "play-outline"} 
              size={24} 
              color={estacionamientoActivo ? "red" : "blue"} 
            />
          </Text>
          <Text style={tw`text-xl font-semibold`}>
            {estacionamientoActivo ? 'Finalizar Estacionamiento' : 'Iniciar Estacionamiento'}
          </Text>
        </View> 
        
        <View style={[tw`p-3 bg-blue-100 mt-2 rounded-lg`]}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={tw`text-lg font-semibold`}>
              Costo hora actual
            </Text>
            <Text style={[tw`text-2xl font-semibold`, sharedStyles.textColorBlue]}>
              {loadingTarifas ? 'Cargando...' :  
                costoActual}
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
              // Si hay estacionamiento activo, usamos color rojo
              estacionamientoActivo 
                ? sharedStyles.bgCustomGreen
                : (
                  zonaDetectada && !zonaDetectada.es_prohibido_estacionar && estadoZona.color === 'red' 
                    ? sharedStyles.bgCustomGreen 
                    : tw`bg-gray-400`
                )
            ]}
            disabled={
              estacionamientoActivo 
                ? false 
                : !zonaDetectada || zonaDetectada.es_prohibido_estacionar || estadoZona.color !== 'red'
            }
            onPress={
              estacionamientoActivo 
                ? finalizarEstacionamientoBackend 
                : iniciarEstacionamientoYAbrirSEM
            }
          >
            <Text style={tw`text-white text-center mr-2`}>
              <Ionicons 
                name={estacionamientoActivo ? "close-outline" : "open-outline"} 
                size={20} 
                color="white" 
              />
            </Text>
            <Text style={tw`text-white text-lg text-center font-bold`}>
              {estacionamientoActivo 
                ? 'Finalizar y Abrir SEM'
                : (
                  !zonaDetectada 
                    ? 'Detectando zona...'
                    : zonaDetectada.es_prohibido_estacionar 
                      ? 'Prohibido estacionar'
                      : estadoZona.color === 'red'
                        ? 'Abrir app SEM y Comenzar'
                        : 'Estacionamiento gratuito'
                )
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

      {/* ✅ Modal para seleccionar vehículo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectorVehiculoVisible}
        onRequestClose={() => setSelectorVehiculoVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg p-6 w-11/12 max-h-[60%]`}>
            <Text style={tw`text-xl font-bold mb-4`}>Selecciona un vehículo</Text>
            {cargandoVehiculos ? (
              <ActivityIndicator size="large" color="#3236FF" />
            ) : (
              <FlatList
                data={vehiculos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSeleccionarVehiculo(item)}
                    style={tw`p-4 border-b border-gray-200 flex-row items-center`}
                  >
                    <Ionicons name="car-sport-outline" size={22} style={tw`mr-4 text-gray-600`} />
                    <Text style={tw`text-lg`}>{item.patente}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              onPress={() => setSelectorVehiculoVisible(false)}
              style={tw`py-3 mt-4`}
            >
              <Text style={tw`text-gray-600 text-center font-bold`}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}