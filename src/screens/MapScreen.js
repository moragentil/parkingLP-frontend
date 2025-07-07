import React from 'react';
import { View, Text } from 'react-native';
import tw from '../utils/tailwind';
import Header from '../components/Header';
import Footer from '../components/Footer';
import sharedStyles from '../utils/sharedStyles'; // Importa tus estilos compartidos

export default function MapScreen({ navigation }) {
  return (
    <View style={tw`flex-1 m-4 bg-gray-200`}>


      {/* Mapa vacío */}
      <View style={tw`flex items-center justify-center`}>
        <View style={[tw`h-72 bg-blue-100 w-full border items-center rounded-xl`, sharedStyles.borderColorBlue]} >
            <Text style={[tw` text-center mt-36`, sharedStyles.textColorBlue]}>Mapa Interactivo</Text>
            </View>
      </View>

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