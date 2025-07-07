import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../utils/tailwind';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Footer({ navigation, currentScreen }) {
  const footerItems = [
    { name: 'Home', label: 'Inicio', icon: 'home-outline' },
    { name: 'Map', label: 'Mapa', icon: 'map-outline' },
    { name: 'Pay', label: 'Pagar', icon: 'card-outline' },
    { name: 'Car', label: 'Mi Auto', icon: 'car-outline' },
  ];

  return (
    <View style={tw`absolute bottom-0 w-full bg-white flex-row justify-around items-center pt-2 pb-4 shadow-lg`}>
      {footerItems.map((item) => {
        const isActive = currentScreen === item.name;
        return (
          <TouchableOpacity
            key={item.name}
            onPress={() => navigation.navigate(item.name)}
            style={[
              tw`items-center justify-center p-2 rounded-lg w-20`,
              isActive ? tw`bg-gray-800` : tw``,
            ]}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={isActive ? 'white' : 'black'}
            />
            <Text
              style={[
                tw`text-xs mt-1`,
                isActive ? tw`text-white` : tw`text-black`,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}