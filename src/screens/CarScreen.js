import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, Alert, Modal, TextInput, ActivityIndicator, ScrollView, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import tw from '../utils/tailwind';
import sharedStyles from '../utils/sharedStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../services/api'; // Asegúrate de importar tu servicio de API

export default function CarScreen({ navigation }) {
  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -34.9214,
    longitude: -57.9544,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const [estacionamientoActivo, setEstacionamientoActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState('');

  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaPatente, setNuevaPatente] = useState('');
  const [agregandoVehiculo, setAgregandoVehiculo] = useState(false);

  // ✅ useEffect para la carga inicial de datos (se ejecuta solo una vez)
  useEffect(() => {
    const inicializarPantalla = async () => {
      setLoading(true);
      await verificarEstacionamientoActivo();
      await cargarVehiculos();
      await getCurrentLocation();
      setLoading(false);
    };

    inicializarPantalla();
  }, []); 

  // ✅ useEffect para manejar el temporizador del estacionamiento
  useEffect(() => {
    if (!estacionamientoActivo) {
      setTiempoTranscurrido('');
      return; // No hacer nada si no hay estacionamiento activo
    }

    // Actualizar el tiempo inmediatamente al cambiar el estado
    setTiempoTranscurrido(calcularTiempoTranscurrido(estacionamientoActivo.hora_inicio));

    // Intervalo para actualizar el tiempo transcurrido cada minuto
    const intervalId = setInterval(() => {
      setTiempoTranscurrido(calcularTiempoTranscurrido(estacionamientoActivo.hora_inicio));
    }, 60000); // Actualizar cada minuto

    // Limpiar el intervalo cuando el componente se desmonte o el estacionamiento cambie
    return () => clearInterval(intervalId);
  }, [estacionamientoActivo]); // Se ejecuta solo cuando 'estacionamientoActivo' cambia

  const verificarEstacionamientoActivo = async () => {
    try {
      const response = await api.get('/estacionamiento-activo');
      if (response.data.status && response.data.estacionamiento) {
        const estacionamiento = response.data.estacionamiento;
        setEstacionamientoActivo(estacionamiento);
        setTiempoTranscurrido(calcularTiempoTranscurrido(estacionamiento.hora_inicio));
        setMapRegion({
          latitude: parseFloat(estacionamiento.latitud),
          longitude: parseFloat(estacionamiento.longitud),
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      } else {
        setEstacionamientoActivo(null);
      }
    } catch (error) {
      console.error("Error verificando estacionamiento activo:", error);
      setEstacionamientoActivo(null);
    }
  };

  const cargarVehiculos = async () => {
    try {
      const response = await api.get('/vehiculos');
      if (response.data.status && response.data.vehiculos) {
        const vehiculosData = response.data.vehiculos;
        setVehiculos(vehiculosData);
        console.log("Vehiculos cargados:", vehiculosData);
        // Seleccionar el que tiene estacionamiento activo o el primero
        const activo = vehiculosData.find(v => v.estacionamientos.some(e => e.estado === 'activo'));
        setVehiculoSeleccionado(activo || vehiculosData[0] || null);
      } else {
        setVehiculos([]);
        setVehiculoSeleccionado(null);
      }
    } catch (error) {
      console.error("Error cargando vehículos:", error);
      setVehiculos([]);
    } finally {
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Se necesita acceso a la ubicación');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setUserLocation(currentLocation.coords);
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
    }
  };

  const openInGoogleMaps = () => {
    if (!estacionamientoActivo) return;
    const { latitud, longitud } = estacionamientoActivo;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}&travelmode=walking`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'No se puede abrir Google Maps');
        }
      })
      .catch((err) => {
        console.error('Error opening Google Maps:', err);
        Alert.alert('Error', 'No se pudo abrir Google Maps');
      });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c * 1000; // Convertir a metros
    return Math.round(distance);
  };

  const calcularTiempoTranscurrido = (horaInicio) => {
    if (!horaInicio) return '';
    
    const [horas, minutos, segundos] = horaInicio.split(':').map(Number);
    const fechaInicio = new Date();
    fechaInicio.setHours(horas, minutos, segundos, 0);

    const ahora = new Date();
    let diffMs = ahora - fechaInicio;
    if (diffMs < 0) diffMs = 0;

    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHoras > 0) {
      return `${diffHoras}h ${diffMins}min`;
    }
    return `${diffMins} min`;
  };

  const handleAgregarVehiculo = async () => {
    if (!nuevaPatente.trim()) {
      Alert.alert('Campo requerido', 'Por favor, ingresa la patente del vehículo.');
      return;
    }

    setAgregandoVehiculo(true);
    try {
      const response = await api.post('/vehiculos', {
        patente: nuevaPatente.trim().toUpperCase(),
      });

      if (response.data.status) {
        Alert.alert('Éxito', 'Vehículo agregado correctamente.');
        setModalVisible(false);
        setNuevaPatente('');
        cargarVehiculos();
      } else {
        Alert.alert('Error', response.data.message || 'No se pudo agregar el vehículo.');
      }
    } catch (error) {
      console.error('Error agregando vehículo:', error);
      if (error.response?.status === 409) {
        Alert.alert('Error', 'La patente ingresada ya existe.');
      } else {
        Alert.alert('Error de servidor', 'Ocurrió un error al intentar agregar el vehículo.');
      }
    } finally {
      setAgregandoVehiculo(false);
    }
  };

  const distance = userLocation && estacionamientoActivo
    ? calculateDistance(userLocation.latitude, userLocation.longitude, estacionamientoActivo.latitud, estacionamientoActivo.longitud)
    : null;

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-200`}>
        <ActivityIndicator size="large" color="#3236FF" />
        <Text style={tw`mt-2 text-gray-600`}>Cargando información...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={tw`flex-1 bg-gray-200`} contentContainerStyle={tw`p-4`}>
      <View style={tw`flex-row justify-between items-center`}>
                 {/* Selector de vehículos */}
        {vehiculos.length > 0 && (
          <TouchableOpacity
            onPress={() => setSelectorVisible(true)}
            style={[tw`rounded-lg p-3 flex-row items-center justify-center flex-1 mr-1 bg-white w-1/2`]}
          >
            <Ionicons name="car-sport-outline" size={18} color="#3730a3" />
            <Text style={tw`text-indigo-800 text-center ml-2 font-semibold text-sm`} numberOfLines={1}>
              {vehiculoSeleccionado ? vehiculoSeleccionado.patente : 'Seleccionar'}
            </Text>
            <Ionicons name="chevron-down-outline" size={18} color="#3730a3" style={tw`ml-auto`} />
          </TouchableOpacity>
        )}
        {/* ✅ Botón modificado para abrir el modal */}
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          style={[tw`rounded-lg p-3 flex-row items-center ml-1 justify-center w-1/2`, sharedStyles.bgCustomBlue]}
        >
          <Ionicons name="add-circle-outline" size={18} color="white" />
          <Text style={tw`text-white text-center ml-2 font-semibold text-sm`}>
            Agregar Vehículo
          </Text>
        </TouchableOpacity>

      </View>

      {estacionamientoActivo ? (
        <>
          <View style={[tw`bg-white rounded-lg p-4 mt-4 shadow border-l-4`, sharedStyles.borderColorBlue]}>
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="car-outline" size={24} color="blue" />
              <Text style={tw`text-lg font-bold text-gray-800 ml-2`}>
                Estacionamiento Activo ({estacionamientoActivo.vehiculo.patente})
              </Text>
            </View>
            <View style={tw`flex-row justify-between mt-4 mx-2`}>
              <View style={tw`items-start`}>
                <View style={tw`flex-row items-center mb-2`}>
                  <View>
                    <Text style={tw`text-gray-500`}>Dirección</Text>
                    <Text style={tw`text-gray-800 font-semibold`}>{estacionamientoActivo.direccion}</Text>
                  </View>
                </View>
                <View style={tw`flex-row items-center`}>
                  <View>
                    <Text style={tw`text-gray-500`}>Distancia</Text>
                    <Text style={[tw`text-gray-800 font-semibold`]}>
                      {distance !== null ? `${distance}m` : 'Calculando...'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={tw`items-start`}>
                <View style={tw`flex-row items-center mb-2`}>
                  <View>
                    <Text style={tw`text-gray-500`}>Estacionado</Text>
                    <Text style={[tw`text-blue-600 font-semibold`]}>{estacionamientoActivo.hora_inicio.substring(0, 5)}</Text>
                  </View>
                </View>
                <View style={tw`flex-row items-center`}>
                  <View>
                    <Text style={tw`text-gray-500`}>Tiempo</Text>
                    <Text style={[tw`text-blue-600 font-semibold`]}>{tiempoTranscurrido}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={[tw`bg-white rounded-t-lg p-4 mt-4 shadow `]}>
            <View style={tw`flex-row items-center `}>
              <Text><Ionicons name="navigate-outline" size={24} style={[tw``, sharedStyles.textColorBlue]}/></Text>
              <Text style={tw`text-xl ml-2 font-semibold text-gray-800`}>Encontrá tu auto estacionado</Text>
            </View>
          </View>
          <View style={[tw`h-44 w-full border overflow-hidden`, sharedStyles.borderColorBlue]}>
            <MapView
              style={tw`flex-1`}
              region={mapRegion}
              showsUserLocation={true}
              showsMyLocationButton={true}
              mapType="standard"
            >
              <Marker
                coordinate={{
                  latitude: parseFloat(estacionamientoActivo.latitud),
                  longitude: parseFloat(estacionamientoActivo.longitud),
                }}
                title="Tu Auto"
                description={estacionamientoActivo.direccion}
                pinColor="red"
              >
                <View style={tw`bg-red-500 rounded-full p-2`}>
                  <Ionicons name="car" size={20} color="white" />
                </View>
              </Marker>
              {userLocation && (
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  title="Tu ubicación"
                  description="Estás aquí"
                  pinColor="blue"
                >
                  <View style={tw`bg-blue-500 rounded-full p-2`}>
                    <Ionicons name="person" size={16} color="white" />
                  </View>
                </Marker>
              )}
            </MapView>
            <TouchableOpacity
              style={tw`absolute top-2 right-2 bg-white rounded-full p-2 shadow`}
              onPress={() => {
                if (!userLocation) return;
                setMapRegion({
                  latitude: (parseFloat(estacionamientoActivo.latitud) + userLocation.latitude) / 2,
                  longitude: (parseFloat(estacionamientoActivo.longitud) + userLocation.longitude) / 2,
                  latitudeDelta: Math.abs(parseFloat(estacionamientoActivo.latitud) - userLocation.latitude) * 2,
                  longitudeDelta: Math.abs(parseFloat(estacionamientoActivo.longitud) - userLocation.longitude) * 2,
                });
              }}
            >
              <Ionicons name="locate" size={20} color="blue" />
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              style={[tw`rounded-b-lg p-4 flex-row items-center justify-center`, sharedStyles.bgCustomBlue]}
              onPress={openInGoogleMaps}
            >
              <Ionicons name="navigate-outline" size={20} color="white" />
              <Text style={tw`text-white text-center ml-2 font-bold`}>
                Abrir en Google Maps
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[tw`bg-green-100 rounded-lg px-3 py-2 mt-4 shadow`, sharedStyles.borderColorBlue]}>
            <View style={tw`flex-col `}>
              <Text style={[tw`font-semibold text-green-700 text-base`]}>Estado del estacionamiento</Text>
              <View style={tw`flex-row mt-2 justify-between items-center`}>
                <Text style={[tw`text-green-700 text-sm`]}>Zona:</Text>
                <Text style={[tw`text-green-700 text-sm font-bold`]}>{estacionamientoActivo.zona?.nombre || 'No definida'}</Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        <View style={tw`flex-1 justify-center items-center bg-gray-100 p-8 mt-4 rounded-lg`}>
          <Ionicons name="car-sport-outline" size={48} color="gray" />
          <Text style={tw`text-lg text-gray-600 mt-4 text-center`}>
            No tienes ningún estacionamiento activo en este momento.
          </Text>
          <Text style={tw`text-sm text-gray-500 mt-2 text-center`}>
            Puedes iniciar uno desde la pantalla "Pagar".
          </Text>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={selectorVisible}
        onRequestClose={() => setSelectorVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg p-6 w-11/12 max-h-[60%]`}>
            <Text style={tw`text-xl font-bold mb-4`}>Seleccionar Vehículo</Text>
            <FlatList
              data={vehiculos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setVehiculoSeleccionado(item);
                    setSelectorVisible(false);
                  }}
                  style={tw`p-4 border-b border-gray-200 flex-row items-center`}
                >
                  <Ionicons 
                    name={item.id === vehiculoSeleccionado?.id ? 'radio-button-on' : 'radio-button-off'} 
                    size={22} 
                    style={tw`mr-4 ${item.id === vehiculoSeleccionado?.id ? 'text-blue-500' : 'text-gray-400'}`}
                  />
                  <Text style={tw`text-lg`}>{item.patente}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setSelectorVisible(false)}
              style={tw`py-3 mt-4`}
            >
              <Text style={tw`text-gray-600 text-center font-bold`}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ✅ Modal para agregar vehículo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg p-6 w-11/12`}>
            <Text style={tw`text-xl font-bold mb-4`}>Agregar Nuevo Vehículo</Text>
            <TextInput
              style={tw`border border-gray-300 rounded-lg p-3 mb-4 text-lg text-center`}
              placeholder="AA 123 BB"
              value={nuevaPatente}
              onChangeText={setNuevaPatente}
              autoCapitalize="characters"
              maxLength={10}
              editable={!agregandoVehiculo}
            />
            <TouchableOpacity
              onPress={handleAgregarVehiculo}
              style={[tw`py-3 rounded-lg`, sharedStyles.bgCustomBlue, agregandoVehiculo && tw`opacity-50`]}
              disabled={agregandoVehiculo}
            >
              {agregandoVehiculo ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={tw`text-white text-center font-bold`}>Agregar Vehículo</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={tw`py-3 mt-2`}
              disabled={agregandoVehiculo}
            >
              <Text style={tw`text-gray-600 text-center`}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}