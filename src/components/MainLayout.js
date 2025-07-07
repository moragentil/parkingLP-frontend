import React, { useState } from 'react';
import { View } from 'react-native';
import tw from '../utils/tailwind';
import Header from './Header';
import Footer from './Footer';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import PayScreen from '../screens/PayScreen';
import CarScreen from '../screens/CarScreen';
import SideMenu from './SideMenu';

export default function MainLayout() {
  const [currentScreen, setCurrentScreen] = useState('Home'); // Estado para manejar la pantalla actual
  const [isMenuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible);
  };

  // Función para renderizar el contenido según la pantalla actual
  const renderContent = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen />;
      case 'Map':
        return <MapScreen />;
      case 'Pay':
        return <PayScreen />;
      case 'Car':
        return <CarScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Función para cambiar el título del Header según la pantalla actual
  const getHeaderTitle = () => {
    switch (currentScreen) {
      case 'Home':
        return 'Parking LP';
      case 'Map':
        return 'Mapa';
      case 'Pay':
        return 'Pagar';
      case 'Car':
        return 'Mi Auto';
      default:
        return 'Parking LP';
    }
  };

  return (
    <View style={tw`flex-1`}>
      <SideMenu
        isVisible={isMenuVisible}
        onClose={toggleMenu}
        navigation={{ navigate: setCurrentScreen }}
      />
      {/* Header */}
      <Header title={getHeaderTitle()} onMenuPress={toggleMenu} />

      {/* Contenido dinámico */}
      <View style={tw`flex-1 bg-gray-200`}>{renderContent()}</View>

      {/* Footer */}
      <Footer navigation={{ navigate: setCurrentScreen }} />
    </View>
  );
}