import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../utils/tailwind';
import Header from '../components/Header';
import sharedStyles from '../utils/sharedStyles';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Importar Ionicons
import { MaterialIcons } from '@expo/vector-icons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function HomeScreen() {
  return (
    <View style={tw`flex-1 bg-gray-100`}>
      {/* Header */}
      <Header title="Parking LP" />

      {/* Mapa vacío */}
      <View style={tw`flex items-center mx-4 mt-4 justify-center`}>
        <View style={[tw`h-40 bg-white w-full border rounded-xl`, sharedStyles.borderColorBlue]} />
      </View>

      {/* Ubicación detectada */}
      <View style={[tw`bg-white rounded-lg p-4 mx-4 mt-4 shadow border-l-4`, sharedStyles.borderColorBlue]}>
        <View style={tw`flex-row items-center mb-3`}>
          <Ionicons name="location-outline" size={24} color="blue" /> {/* Ícono de ubicación */}
          <Text style={tw`text-lg font-bold text-gray-800`}>Ubicación detectada</Text>
        </View>
        <View style={tw`flex-row items-center mb-3`}>
          <MaterialIcons name="my-location" size={16} color="green" style={tw`mr-2 ml-1`}/>
          <Text style={tw`text-gray-800`}>Av. 13 entre 48 y 49</Text>
        </View>
         <View style={tw`flex-row items-center mx-2`}>
        <Text style={tw`text-gray-500`}>Detectado automáticamente</Text>
        </View>
      </View>

      {/* Zona detectada */}
      <View style={[tw`bg-white rounded-lg p-4 mx-4 mt-4 shadow border-l-4`, sharedStyles.borderColorGreen]}>
        <View style={tw`flex-row justify-between items-center mb-3`}>
        <View style={tw`flex-row items-center`}>
        <Ionicons name="map-outline" size={22} style={sharedStyles.textColorGreen} />
        <Text style={tw`text-gray-800 ml-1 text-lg font-bold `}>Zona detectada</Text>
        </View>
        <View style={tw`flex-row items-center bg-green-100 rounded-full px-2`}>
            <FontAwesome name="circle" size={8} style={sharedStyles.textColorGreen} />
            <Text style={[tw`p-1 font-medium ml-1`, sharedStyles.textColorGreen]}>Zona Verde</Text>
        </View>
        </View>
        <View style={tw`flex-row items-center mx-4 mt-1 justify-between`}>
            <View style={tw`flex-row items-center`}>
                <Ionicons name="time-outline" size={20} style={tw`text-gray-800 mr-1`} />
                <View style={tw`flex-col `}>
                    <Text style={tw`text-gray-500`}>Lun-Vier:</Text>
                    <Text style={tw`text-gray-800`}>7:00 - 20:00 </Text>
                </View>
            </View>
            <View style={tw`flex-row items-center`}>
                <Ionicons name="time-outline" size={20} style={tw`text-gray-800 mr-1`} />
                <View style={tw`flex-col `}>
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

      <View style={[tw`bg-gray-200 rounded-lg p-4 mx-4 mt-4 shadow border border-gray-500`]}>
        <View style={tw`flex-col items-center`}>
            <View style={tw`flex-row items-center mb-2`}>
            <Ionicons name="information-circle-outline" size={24} style={tw`text-gray-700`} />
            <Text style={tw`text-lg font-bold text-gray-700 ml-2`}>Sin estacionamiento activo</Text>
            </View>
            <Text style={tw`text-gray-600 text-center`}>
                Toca "Pagar" para iniciar
            </Text>
        </View>
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