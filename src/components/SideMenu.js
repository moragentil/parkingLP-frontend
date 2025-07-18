import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import tw from '../utils/tailwind';
import Ionicons from 'react-native-vector-icons/Ionicons';
import sharedStyles from '../utils/sharedStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function SideMenu({ isVisible, onClose, navigation, setCurrentScreen, currentScreen }) {
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('Usuario');

  const menuItems = [
    { name: 'Home', label: 'Inicio', icon: 'home-outline' },
    { name: 'Map', label: 'Mapa interactivo', icon: 'map-outline' },
    { name: 'Pay', label: 'Pagar estacionamiento', icon: 'card-outline' },
    { name: 'Car', label: 'Mi Auto', icon: 'car-outline' },
    { name: 'Settings', label: 'Configuración', icon: 'settings-outline' },
    { name: 'Login', label: 'Cerrar Sesión', icon: 'log-out-outline' },
  ];

  useEffect(() => {
    if (isVisible) {
      cargarDatosUsuario();
    }
  }, [isVisible]);

  const cargarDatosUsuario = async () => {
    try {
      // Primero intentar obtener del storage local
      const usuarioLocal = await AsyncStorage.getItem('usuario');
      if (usuarioLocal) {
        const usuario = JSON.parse(usuarioLocal);
        setUserPhone(usuario.telefono || 'Sin teléfono');
        setUserName(usuario.nombre || 'Usuario');
      }

      // Luego obtener datos actuales del servidor
      const response = await api.get('/me');
      
      if (response.data.status) {
        const usuario = response.data.usuario;
        setUserPhone(usuario.telefono || 'Sin teléfono');
        setUserName(usuario.nombre || 'Usuario');
        
        // Actualizar el storage local con datos frescos
        await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
      }
    } catch (error) {
      console.error('Error cargando datos del usuario en SideMenu:', error);
      // En caso de error, mantener los datos del storage local o valores por defecto
    }
  };

  const handleNavigate = (screen) => {
    onClose();
    if (screen === 'Login') {
      navigation.replace('Login');
    } else {
      setCurrentScreen(screen);
    }
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
          <View style={tw`ml-4 flex-1`}>
            <Text style={tw`text-white text-lg font-semibold`} numberOfLines={1}>
              {userName}
            </Text>
            <Text style={tw`text-white text-sm opacity-90`} numberOfLines={1}>
              {userPhone}
            </Text>
          </View>
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