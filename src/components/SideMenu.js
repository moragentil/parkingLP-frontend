import React from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import tw from '../utils/tailwind';
import Ionicons from 'react-native-vector-icons/Ionicons';
import sharedStyles from '../utils/sharedStyles';

export default function SideMenu({ isVisible, onClose, navigation, currentScreen }) {
  const menuItems = [
    { name: 'Home', label: 'Inicio', icon: 'home-outline' },
    { name: 'Map', label: 'Mapa interactivo', icon: 'map-outline' },
    { name: 'Pay', label: 'Pagar estacionamiento', icon: 'card-outline' },
    { name: 'Car', label: 'Mi Auto', icon: 'car-outline' },
    { name: 'Settings', label: 'Configuración', icon: 'settings-outline' },
    { name: 'Login', label: 'Cerrar Sesión', icon: 'log-out-outline' },
  ];

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[tw`flex-1`, sharedStyles.bgCustomBlue]}>
        {/* Header */}
        <View style={tw`flex-row items-center justify-between p-4`}>
          <View style={tw`w-8`} />
          <Text style={tw`text-white text-2xl font-bold`}>Menú</Text>
          <TouchableOpacity onPress={onClose} style={tw`p-2`}>
            <Ionicons name="close-outline" size={32} color="white" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={tw`flex-row items-center px-6 py-4`}>
          <Ionicons name="person-circle-outline" size={32} color="white" />
          <Text style={tw`ml-4 text-white text-lg`}>1136123456</Text>
        </View>

        {/* Menu Items */}
        <View style={tw`p-4 mt-4`}>
          {menuItems.map((item) => {
            const isActive = currentScreen === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                style={[
                  tw`flex-row items-center p-4 rounded-lg mb-2`,
                  isActive ? tw`bg-white` : tw``,
                ]}
                onPress={() => handleNavigate(item.name)}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={isActive ? '#4f46e5' : 'white'}
                />
                <Text
                  style={[
                    tw`ml-4 text-lg font-semibold`,
                    isActive ? tw`text-blue-800` : tw`text-white`,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View style={tw`absolute bottom-5 left-0 right-0 items-center`}>
            <Text style={tw`text-white text-xs`}>Municipalidad de La Plata • UTN</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}