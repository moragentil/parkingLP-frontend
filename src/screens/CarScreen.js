import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../utils/tailwind';
import sharedStyles from '../utils/sharedStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function CarScreen({ navigation }) {
  return (
    <View style={tw`flex-1 m-4 bg-gray-200`}>

      <View style={[tw`bg-white rounded-lg p-4 mt-4 shadow border-l-4`, sharedStyles.borderColorBlue]}>
        <View style={tw`flex-row items-center mb-3`}>
          <Ionicons name="car-outline" size={24} color="blue" />
          <Text style={tw`text-lg font-bold text-gray-800 ml-2`}>Ubicación del auto</Text>
        </View>

        {/* Contenedor principal */}
        <View style={tw`flex-row justify-between mt-4 mx-2`}>
          {/* Columna izquierda */}
          <View style={tw`items-start`}>
            {/* Dirección */}
            <View style={tw`flex-row items-center mb-2`}>
              <View>
                <Text style={tw`text-gray-500`}>Dirección</Text>
                <Text style={tw`text-gray-800 font-semibold`}>Av. 13 entre 48 y 49</Text>
              </View>
            </View>

            {/* Distancia */}
            <View style={tw`flex-row items-center`}>
              <View>
                <Text style={tw`text-gray-500`}>Distancia</Text>
                <Text style={[tw`text-gray-800 font-semibold`]}>250m</Text>
              </View>
            </View>
          </View>

          {/* Columna derecha */}
          <View style={tw`items-start`}>
            {/* Estacionado */}
            <View style={tw`flex-row items-center mb-2`}>
              <View>
                <Text style={tw`text-gray-500`}>Estacionado</Text>
                <Text style={[tw`text-blue-600 font-semibold`]}>16:30</Text>
              </View>
            </View>

            {/* Tiempo */}
            <View style={tw`flex-row items-center`}>
              <View>
                <Text style={tw`text-gray-500`}>Tiempo</Text>
                <Text style={[tw`text-blue-600 font-semibold`]}>3 min</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Navegacion hacia el auto */}

      <View style={[tw`bg-white rounded-t-lg p-4 mt-4 shadow `]}>
        <View style={tw`flex-row items-center `}>
        <Text><Ionicons name="navigate-outline" size={24} style={[tw``, sharedStyles.textColorBlue]}/></Text>
        <Text style={tw`text-xl ml-2 font-semibold text-gray-800`} >Encontrá tu auto estacionado</Text>
        </View>
      </View>
      <View style={[tw`h-44 bg-blue-100 w-full  items-center `]} >
        <Text style={[tw` text-center mt-20`, sharedStyles.textColorBlue]}>Mapa Interactivo</Text>
      </View>

      <View>
        <TouchableOpacity
          style={[tw`rounded-b-lg p-4  flex-row items-center justify-center`, sharedStyles.bgCustomBlue]}
        >
          <Ionicons name="navigate-outline" size={20} color="white" />
          <Text style={tw`text-white text-center ml-2 font-bold`}>
            Abrir en Google Maps
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={[tw`bg-green-100 rounded-lg p-4 mt-4 shadow`, sharedStyles.borderColorBlue]}>
        <View style={tw`flex-col `}>
          <Text style={[tw`font-semibold text-green-700 text-lg`]} >Estado del estacionamiento</Text>
          <View style={tw`flex-row mt-2 justify-between items-center`}>
            <Text style={[tw`text-green-700 text-base`]}>Tiempo restante:</Text>
            <Text style={[tw`text-green-700 text-base`]}>2h 15min</Text>
          </View>
        </View>
      </View>

    </View>
  );
}