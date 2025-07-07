import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../utils/tailwind';
import Header from '../components/Header';

export default function HomeScreen() {
  return (
    <View style={tw`flex-1 bg-gray-100`}>
      {/* Header */}
      <Header title="Parking LP" />

      {/* Mapa vacío */}
      <View style={tw`h-48 bg-blue-200`} />

      {/* Ubicación detectada */}
      <View style={tw`bg-white rounded-lg p-4 m-4 shadow`}>
        <Text style={tw`text-blue-500 text-lg font-bold mb-2`}>Ubicación detectada</Text>
        <Text style={tw`text-gray-700`}>Av. 13 entre 48 y 49</Text>
        <Text style={tw`text-gray-500`}>Detectado automáticamente</Text>
      </View>

      {/* Zona detectada */}
      <View style={tw`bg-white rounded-lg p-4 m-4 shadow`}>
        <Text style={tw`text-blue-500 text-lg font-bold mb-2`}>Zona detectada</Text>
        <View style={tw`flex-row items-center justify-between`}>
          <Text style={tw`text-green-500 font-bold`}>Zona Verde</Text>
          <Text style={tw`text-gray-700`}>Pago requerido hasta las 20:00hs</Text>
        </View>
        <Text style={tw`text-gray-500`}>Lun-Vier: 7:00 - 20:00</Text>
        <Text style={tw`text-gray-500`}>Sábados: 9:00 - 20:00</Text>
      </View>

      {/* Botones */}
      <View style={tw`flex-row justify-around m-4`}>
        <TouchableOpacity style={tw`bg-blue-500 rounded-lg py-2 px-4`}>
          <Text style={tw`text-white font-bold`}>Pagar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`bg-blue-500 rounded-lg py-2 px-4`}>
          <Text style={tw`text-white font-bold`}>Zona Límite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}