import React from 'react';
import { View, Text } from 'react-native';
import tw from '../utils/tailwind';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PayScreen({ navigation }) {
  return (
    <View style={tw`flex-1 bg-gray-200`}>

      {/* Contenido */}
      <View style={tw`flex-1 items-center justify-center`}>
        <Text style={tw`text-lg font-bold text-gray-800`}>Pantalla de pago</Text>
      </View>

      {/* Footer */}
      <Footer navigation={navigation} />
    </View>
  );
}