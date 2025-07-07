import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../utils/tailwind';
import sharedStyles from '../utils/sharedStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MaterialIcons } from '@expo/vector-icons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function HomeScreen({ navigation }) {
  return (
    <View style={tw`flex-1 m-4 bg-gray-200`}>


      {/* Mapa vacío */}
      <View style={tw`flex items-center justify-center`}>
        <View style={[tw`h-44 bg-blue-100 w-full border items-center rounded-xl`, sharedStyles.borderColorBlue]} >
            <Text style={[tw` text-center mt-20`, sharedStyles.textColorBlue]}>Mapa Interactivo</Text>
            </View>
      </View>

      {/* Ubicación detectada */}
      <View style={[tw`bg-white rounded-lg p-4 mt-4 shadow border-l-4`, sharedStyles.borderColorBlue]}>
        <View style={tw`flex-row items-center mb-3`}>
          <Text><Ionicons name="location-outline" size={24} color="blue" /> </Text>{/* Ícono de ubicación */}
          <Text style={tw`text-lg font-bold text-gray-800`}>Ubicación detectada</Text>
        </View>
        <View style={tw`flex-row items-center ml-1 mb-3`}>
          <Text><MaterialIcons name="my-location" size={16} color="green" style={tw`mr-2 ml-1`}/></Text>
          <Text style={tw`text-gray-800 ml-2`}>Av. 13 entre 48 y 49</Text>
        </View>
         <View style={tw`flex-row items-center mx-2`}>
        <Text style={tw`text-gray-500`}>Detectado automáticamente</Text>
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