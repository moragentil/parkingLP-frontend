import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import tw from '../utils/tailwind';
import sharedStyles from '../utils/sharedStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MaterialIcons } from '@expo/vector-icons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Detectando ubicación...');
  const [mapRegion, setMapRegion] = useState({
    latitude: -34.9214, // La Plata por defecto
    longitude: -57.9544,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

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

      // Obtener dirección a partir de coordenadas
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

  return (
    <View style={tw`flex-1 m-4 bg-gray-200`} >
      {/* Mapa interactivo */}
      <View style={tw`flex items-center justify-center`} >
        <View style={[tw`h-44 w-full border rounded-xl overflow-hidden`, sharedStyles.borderColorBlue]}>
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

      {/* Ubicación detectada */}
      <View style={[tw`bg-white rounded-lg p-4 mt-4 shadow border-l-4`, sharedStyles.borderColorBlue]}>
        <View style={tw`flex-row items-center mb-3`}>
          <Text><Ionicons name="location-outline" size={24} color="blue" /> </Text>
          <Text style={tw`text-lg font-bold text-gray-800`}>Ubicación detectada</Text>
        </View>
        <View style={tw`flex-row items-center ml-1 mb-3`}>
          <Text><MaterialIcons name="my-location" size={16} color="green" style={tw`mr-2 ml-1`}/></Text>
          <Text style={tw`text-gray-800 ml-2 flex-1`}>{address}</Text>
        </View>
        <View style={tw`flex-row items-center mx-2`}>
          <Text style={tw`text-gray-500`}>
            {location ? 'Detectado automáticamente' : 'Detectando ubicación...'}
          </Text>
        </View>
      </View>

      {/* Zona detectada */}
      <View style={[tw`bg-white rounded-lg p-4  mt-4 shadow border-l-4`, sharedStyles.borderColorGreen]}>
        <View style={tw`flex-row justify-between items-center ml-1 mb-3`}>
        <View style={tw`flex-row items-center`}>
        <Text><Ionicons name="map-outline" size={22} style={sharedStyles.textColorGreen} /></Text>
        <Text style={tw`text-gray-800 ml-2 text-lg font-bold `}>Zona detectada</Text>
        </View>
        <View style={tw`flex-row items-center bg-green-100 rounded-full px-2`}>
            <Text><FontAwesome name="circle" size={8} style={sharedStyles.textColorGreen} /></Text>
            <Text style={[tw`p-1 font-medium ml-1`, sharedStyles.textColorGreen]}>Zona Verde</Text>
        </View>
        </View>
        <View style={tw`flex-row items-center mx-4 mt-1 justify-between`}>
            <View style={tw`flex-row items-center`}>
                <Text><Ionicons name="time-outline" size={20} style={tw`text-gray-800 mr-1`} /></Text>
                <View style={tw`flex-col ml-1`}>
                    <Text style={tw`text-gray-500`}>Lun-Vier:</Text>
                    <Text style={tw`text-gray-800`}>7:00 - 20:00 </Text>
                </View>
            </View>
            <View style={tw`flex-row items-center`}>
                <Text><Ionicons name="time-outline" size={20} style={tw`text-gray-800 mr-1`} /></Text>
                <View style={tw`flex-col ml-1`}>
                    <Text style={tw`text-gray-500`}>Sábados:</Text>
                    <Text style={tw`text-gray-800`}>9:00 - 20:00 </Text>
                </View>
            </View>
        </View>
        <View style={tw`flex-row items-center w-full mt-2 justify-center`}>
            <Text style={[tw` text-sm mx-4 mt-2 font-medium p-1 px-4 rounded-full bg-green-100`, sharedStyles.textColorGreen]}>
                Pago requerido hasta las 20:00 hs
            </Text>
        </View>
      </View>

      <View style={tw`bg-gray-300 border border-gray-400 flex-row justify-center items-center rounded-lg p-2 mt-4 shadow `}>
        <Text><Ionicons name="information-circle-outline" size={24} style={tw`text-gray-800 `} /></Text>
        <Text style={tw`ml-1 text-gray-800 text-base font-semibold `}>Sin estacionamiento activo</Text>
      </View>

      {/* Botones */}
      <View style={tw`flex-row justify-between mr-2 mt-4`}>
        <TouchableOpacity 
          style={[tw` mr-2 p-4 w-1/2 rounded-lg  `, sharedStyles.bgCustomBlue]}
          onPress={() => navigation.navigate('Pay')}
        >
          <Text style={tw`text-white text-center font-bold`}>Pagar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[tw` p-4 w-1/2 rounded-lg `, sharedStyles.bgCustomBlue]}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={tw`text-white text-center font-bold`}>Zona Límite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}