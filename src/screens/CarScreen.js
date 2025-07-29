import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, Alert, Modal, TextInput, ActivityIndicator, ScrollView } from 'react-native';
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

  // Estados para el modal de agregar vehículo
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaPatente, setNuevaPatente] = useState('');
  const [agregandoVehiculo, setAgregandoVehiculo] = useState(false);

  // Ubicación simulada del auto estacionado (deberías reemplazar esto con datos del backend)
  const carLocation = {
    latitude: -34.9220,
    longitude: -57.9540,
    address: "Av. 13 entre 48 y 49"
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

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
    const url = `https://www.google.com/maps/dir/?api=1&destination=${carLocation.latitude},${carLocation.longitude}&travelmode=walking`;
    
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
        // Aquí podrías recargar la lista de vehículos si la estuvieras mostrando
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

  const distance = userLocation 
    ? calculateDistance(userLocation.latitude, userLocation.longitude, carLocation.latitude, carLocation.longitude)
    : 250;

  return (
    <ScrollView style={tw`flex-1 bg-gray-200`} contentContainerStyle={tw`p-4`}>
      <View>
        {/* ✅ Botón modificado para abrir el modal */}
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          style={[tw`rounded-lg p-3 flex-row items-center justify-center`, sharedStyles.bgCustomBlue]}
        >
          <Ionicons name="add-circle-outline" size={18} color="white" />
          <Text style={tw`text-white text-center ml-2 font-semibold text-sm`}>
            Agregar Vehículo
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[tw`bg-white rounded-lg p-4 mt-4 shadow border-l-4`, sharedStyles.borderColorBlue]}>
        <View style={tw`flex-row items-center mb-3`}>
          <Ionicons name="car-outline" size={24} color="blue" />
          <Text style={tw`text-lg font-bold text-gray-800 ml-2`}>Ubicación del auto</Text>
        </View>
        <View style={tw`flex-row justify-between mt-4 mx-2`}>
          <View style={tw`items-start`}>
            <View style={tw`flex-row items-center mb-2`}>
              <View>
                <Text style={tw`text-gray-500`}>Dirección</Text>
                <Text style={tw`text-gray-800 font-semibold`}>{carLocation.address}</Text>
              </View>
            </View>
            <View style={tw`flex-row items-center`}>
              <View>
                <Text style={tw`text-gray-500`}>Distancia</Text>
                <Text style={[tw`text-gray-800 font-semibold`]}>{distance}m</Text>
              </View>
            </View>
          </View>
          <View style={tw`items-start`}>
            <View style={tw`flex-row items-center mb-2`}>
              <View>
                <Text style={tw`text-gray-500`}>Estacionado</Text>
                <Text style={[tw`text-blue-600 font-semibold`]}>16:30</Text>
              </View>
            </View>
            <View style={tw`flex-row items-center`}>
              <View>
                <Text style={tw`text-gray-500`}>Tiempo</Text>
                <Text style={[tw`text-blue-600 font-semibold`]}>3 min</Text>
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
              latitude: carLocation.latitude,
              longitude: carLocation.longitude,
            }}
            title="Tu Auto"
            description={carLocation.address}
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
            setMapRegion({
              latitude: (carLocation.latitude + (userLocation?.latitude || -34.9214)) / 2,
              longitude: (carLocation.longitude + (userLocation?.longitude || -57.9544)) / 2,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
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
            <Text style={[tw`text-green-700 text-sm`]}>Tiempo restante:</Text>
            <Text style={[tw`text-green-700 text-sm`]}>2h 15min</Text>
          </View>
        </View>
      </View>

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