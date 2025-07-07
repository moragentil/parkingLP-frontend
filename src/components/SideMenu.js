import React from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import tw from '../utils/tailwind';
import Ionicons from 'react-native-vector-icons/Ionicons';
import sharedStyles from '../utils/sharedStyles';

export default function SideMenu({ isVisible, onClose, navigation }) {
  const menuItems = [
    { name: 'Home', label: 'Inicio', icon: 'home-outline' },
    { name: 'Map', label: 'Mapa', icon: 'map-outline' },
    { name: 'Pay', label: 'Pagar', icon: 'card-outline' },
    { name: 'Car', label: 'Mi Auto', icon: 'car-outline' },
    { name: 'Login', label: 'Cerrar Sesión', icon: 'log-out-outline' },
  ];

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={tw`flex-1 bg-black bg-opacity-50`}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <SafeAreaView style={tw`w-3/4 bg-white h-full`}>
            <View style={[tw`p-5`, sharedStyles.bgCustomBlue]}>
                <Text style={tw`text-white text-xl font-bold`}>Parking LP</Text>
                <Text style={tw`text-white`}>Menú Principal</Text>
            </View>
          <View style={tw`p-4`}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={tw`flex-row items-center py-4`}
                onPress={() => handleNavigate(item.name)}
              >
                <Ionicons name={item.icon} size={24} color="black" />
                <Text style={tw`ml-4 text-lg text-gray-800`}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
}