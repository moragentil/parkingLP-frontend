import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import tw from '../utils/tailwind';
import Header from '../components/Header';
import Footer from '../components/Footer';
import sharedStyles from '../utils/sharedStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
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
      <View style={[tw`bg-white rounded-lg p-3 mt-4 shadow `]}>
        <Text style={tw`text-gray-800 text-lg font-bold`}>Leyenda de Zonas</Text>
        <View style={tw`flex-col items-center mt-2`}>
          <View style={[tw`flex-row p-2 mb-1 items-center rounded-lg w-full justify-between bg-green-100`]}>
            <Text style={[tw`font-semibold`, sharedStyles.textColorGreenDark]}>Zona Verde</Text>
            <View style={tw`flex-col justify-center items-center`}>
              <Text style={tw`text-gray-500 text-xs`}>$300/$500</Text>
              <Text style={tw`text-gray-500 text-xs`}>por hora</Text>
            </View>
            <View style={tw`flex-col justify-center items-start`}>
              <Text style={tw`text-gray-500 text-xs`}>Lun-Vier: 7:00 - 20:00</Text>
              <Text style={tw`text-gray-500 text-xs`}>Sáb: 9:00 - 20:00</Text>
            </View>
          </View>
          <View style={[tw`flex-row p-2 mb-1 items-center rounded-lg w-full justify-between `, sharedStyles.bgCustomPink]}>
            <Text style={[tw`font-semibold`, sharedStyles.textColorPink]}>Zona Rosa</Text>
            <View style={tw`flex-col justify-center items-center`}>
              <Text style={tw`text-gray-500 text-xs`}>$300/$500</Text>
              <Text style={tw`text-gray-500 text-xs`}>por hora</Text>
            </View>
            <View style={tw`flex-col justify-center items-start`}>
              <Text style={tw`text-gray-500 text-xs`}>Lun-Vier: 7:00 - 20:00</Text>
              <Text style={tw`text-gray-500 text-xs`}>Sáb: 9:00 - 20:00</Text>
            </View>
          </View>
          <View style={[tw`flex-row p-2 mb-1 items-center rounded-lg w-full justify-between `, sharedStyles.bgCustomBlueLight]}>
            <Text style={[tw`font-semibold`, sharedStyles.textColorBlueDark]}>Zona Azul</Text>
            <View style={tw`flex-col justify-center items-center`}>
              <Text style={tw`text-gray-500 text-xs`}>$300/$500</Text>
              <Text style={tw`text-gray-500 text-xs`}>por hora</Text>
            </View>
            <View style={tw`flex-col justify-center items-start`}>
              <Text style={tw`text-gray-500 text-xs`}>Lun-Vier: 7:00 - 20:00</Text>
              <Text style={tw`text-gray-500 text-xs`}>Sáb: 9:00 - 20:00</Text>
            </View>
          </View>
          <View style={[tw`flex-row p-2 mb-1 items-center rounded-lg w-full justify-between`, sharedStyles.bgCustomYellow]}>
            <Text style={[tw`font-semibold`, sharedStyles.textColorYellow]}>Zona Amarilla</Text>
            <View style={tw`flex-col justify-center items-center`}>
              <Text style={tw`text-gray-500 text-xs`}>$300/$500</Text>
              <Text style={tw`text-gray-500 text-xs`}>por hora</Text>
            </View>
            <View style={tw`flex-col justify-center items-start`}>
              <Text style={tw`text-gray-500 text-xs`}>Lun-Vier: 7:00 - 20:00</Text>
              <Text style={tw`text-gray-500 text-xs`}>Sáb: 9:00 - 20:00</Text>
            </View>
          </View>
          <View style={[tw`flex-row p-3 items-center rounded-lg w-full justify-center bg-gray-300`]}>
            <Text style={tw` text-gray-800 font-medium`}>Prohibido Estacionar</Text>
          </View>
        </View>
      </View>
    </View>
  );
}