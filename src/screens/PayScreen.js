import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import tw from '../utils/tailwind';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import sharedStyles from '../utils/sharedStyles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function PayScreen({ navigation }) {
  const [showDetails, setShowDetails] = useState(false); // Estado para controlar la visibilidad

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
            <Text style={tw`text-gray-800`}>Av. 13 entre 48 y 49</Text>
          </View>
          <View style={tw`flex-row items-center bg-green-100 rounded-full px-2`}>
            <FontAwesome name="circle" size={8} style={sharedStyles.textColorGreen} />
            <Text style={[tw`p-1 font-medium ml-1`, sharedStyles.textColorGreen]}>Zona Verde</Text>
          </View>
        </View>
        <View style={tw`flex-row justify-between w-full items-center mb-1`}>
          <Text>Estado actual:</Text>
          <View style={tw`flex-row items-center bg-red-100 rounded-full px-2 py-1`}>
            <FontAwesome name="circle" size={8} color="red" />
            <Text style={tw`text-red-600 font-medium ml-2`}>Pago Requerido</Text>
          </View>
        </View>

        {/* Botón para mostrar/ocultar detalles */}
        <TouchableOpacity
          onPress={() => setShowDetails(!showDetails)} // Alternar visibilidad
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
            <View style={tw`items-start`}>
              <Text style={tw`text-gray-500 mb-2`}>Horarios de pago</Text>
              <Text style={tw`text-gray-500 font-semibold text-center`}>Lun-Vier: 7:00 - 14:00</Text>
              <Text style={tw`text-gray-500 font-semibold text-center`}>Lun-Vier: 14:00 - 20:00</Text>
              <Text style={tw`text-gray-500 font-semibold text-center`}>Sab: 9:00 - 20:00</Text>
            </View>

            {/* Columna de tarifas */}
            <View style={tw`items-start`}>
              <Text style={tw`text-gray-500 mb-2`}>Tarifa por hora</Text>
              <Text style={tw`text-green-600 font-semibold text-center`}>$500</Text>
              <Text style={tw`text-green-600 font-semibold text-center`}>$300</Text>
              <Text style={tw`text-green-600 font-semibold text-center`}>$300</Text>
            </View>
          </View>
        )}
      </View>

      <View style={[tw`bg-white rounded-lg p-4 mt-4 shadow`]}>
        <View style={tw`flex-row items-center mb-1`}>
          <Text style={tw`mr-2`}><Ionicons name="play-outline" size={24} color="blue" /></Text>
          <Text style={tw`text-xl font-semibold`} >Iniciar Estacionamiento</Text>
          </View> 
          <View style={[tw`p-3 bg-blue-100 mt-2 rounded-lg`, ]} >
            <View style={tw`flex-row items-center justify-between`} >
            <Text style={tw`text-lg font-semibold`}>Costo hora actual:</Text>
            <Text style={[tw`text-2xl font-semibold`, sharedStyles.textColorBlue]}>$300</Text>
            </View>
            <Text style={tw`text-gray-500 mt-2`}>El costo final dependerá del tiempo real de estacionamiento</Text>
          </View>
          <View style={tw`flex-row items-center justify-center mt-4`}>
            <TouchableOpacity style={[tw`flex-row justify-center items-center mr-2 p-4 w-full rounded-lg  `, sharedStyles.bgCustomGreen]}>
             <Text style={tw`text-white text-center mr-2`}><Ionicons name="open-outline" size={20} color="white" /></Text>
            <Text style={tw`text-white text-lg text-center font-bold`}>Abrir App SEM y Comenzar</Text>
          </TouchableOpacity>
          </View>
      </View>

      <View style={[tw`bg-blue-100 rounded-lg p-3  mt-3 shadow`]}>
        <View style={tw`flex-row items-center`}>
          <Text style={tw`mr-1`}><Ionicons name="information-circle-outline" size={18} color="blue" /></Text>
        <View style={tw``}>
          <Text style={[tw``, sharedStyles.textColorBlue]} >Información importante</Text>
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