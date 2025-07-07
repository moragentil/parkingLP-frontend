import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../utils/tailwind';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Footer({ navigation }) {
  return (
    <View style={tw`absolute bottom-0 w-full bg-white flex-row justify-around pt-4 pb-6`}>
      {/* Botón Inicio */}
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={tw`items-center`}>
        <Ionicons name="home-outline" size={24} color="black" />
        <Text style={tw`text-black text-xs`}>Inicio</Text>
      </TouchableOpacity>

      {/* Botón Mapa */}
      <TouchableOpacity onPress={() => navigation.navigate('Map')} style={tw`items-center`}>
        <Ionicons name="map-outline" size={24} color="black" />
        <Text style={tw`text-black text-xs`}>Mapa</Text>
      </TouchableOpacity>

      {/* Botón Pagar */}
      <TouchableOpacity onPress={() => navigation.navigate('Pay')} style={tw`items-center`}>
        <Ionicons name="card-outline" size={24} color="black" />
        <Text style={tw`text-black text-xs`}>Pagar</Text>
      </TouchableOpacity>

      {/* Botón Mi Auto */}
      <TouchableOpacity onPress={() => navigation.navigate('Car')} style={tw`items-center`}>
        <Ionicons name="car-outline" size={24} color="black" />
        <Text style={tw`text-black text-xs`}>Mi Auto</Text>
      </TouchableOpacity>
    </View>
  );
}