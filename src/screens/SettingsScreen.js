import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import tw from '../utils/tailwind';
import Ionicons from 'react-native-vector-icons/Ionicons';
import sharedStyles from '../utils/sharedStyles';

export default function SettingsScreen({ navigation }) {
  const [fullName, setFullName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('1136123456');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSaveChanges = () => {
    alert('Cambios guardados');
  };

  const handleLogout = () => {
    // Aquí iría la lógica para cerrar sesión.
    // Por ahora, navegamos a la pantalla de Login.
    navigation.navigate('Login');
  };

  return (
    <ScrollView style={tw`flex-1 bg-gray-100`} contentContainerStyle={tw`p-4 pb-24`}>
      {/* Sección de Perfil */}
      <View style={tw`bg-white p-4 rounded-lg shadow mb-4`}>
        <Text style={tw`text-xl font-bold mb-4 text-gray-800`}>Mi Perfil</Text>
        <View style={tw`flex-row items-center mb-4`}>
          <Ionicons name="person-circle-outline" size={64} style={sharedStyles.textColorBlue} />
          <View style={tw`ml-4`}>
            <Text style={tw`text-lg font-semibold`}>{fullName}</Text>
            <Text style={tw`text-gray-500`}>{email}</Text>
          </View>
        </View>
        
        <Text style={tw`text-gray-600 mb-2`}>Nombre Completo</Text>
        <TextInput
          style={tw`border border-gray-300 rounded px-4 py-2 mb-4`}
          value={fullName}
          onChangeText={setFullName}
        />
        
        <Text style={tw`text-gray-600 mb-2`}>Email</Text>
        <TextInput
          style={tw`border border-gray-300 rounded px-4 py-2 mb-4`}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text style={tw`text-gray-600 mb-2`}>Teléfono</Text>
        <TextInput
          style={tw`border border-gray-300 rounded px-4 py-2 mb-4`}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[tw`py-3 rounded-lg`, sharedStyles.bgCustomBlue]}
          onPress={handleSaveChanges}
        >
          <Text style={tw`text-white text-center font-bold`}>Guardar Cambios</Text>
        </TouchableOpacity>
      </View>

      {/* Sección de Configuración de la App */}
      <View style={tw`bg-white p-4 rounded-lg shadow mb-4`}>
        <Text style={tw`text-xl font-bold mb-4 text-gray-800`}>Configuración</Text>
        
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-lg`}>Activar Notificaciones</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notificationsEnabled ? "#3236FF" : "#f4f3f4"}
            onValueChange={() => setNotificationsEnabled(previousState => !previousState)}
            value={notificationsEnabled}
          />
        </View>

        <TouchableOpacity style={tw`flex-row items-center py-2`}>
          <Ionicons name="lock-closed-outline" size={24} color="gray" />
          <Text style={tw`ml-4 text-lg`}>Cambiar Contraseña</Text>
        </TouchableOpacity>
      </View>

      {/* Sección de Vehículo */}
      <View style={tw`bg-white p-4 rounded-lg shadow mb-4`}>
        <Text style={tw`text-xl font-bold mb-4 text-gray-800`}>Mi Vehículo</Text>
        <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`text-lg`}>Patente: AA 123 BB</Text>
            <TouchableOpacity>
                <Text style={[tw`font-semibold`, sharedStyles.textColorBlue]}>Cambiar</Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* Botón de Cerrar Sesión */}
      <TouchableOpacity
        style={tw`bg-red-500 py-3 rounded-lg mt-4`}
        onPress={handleLogout}
      >
        <Text style={tw`text-white text-center font-bold`}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}