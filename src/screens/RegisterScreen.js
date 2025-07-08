import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import tw from '../utils/tailwind';
import sharedStyles from '../utils/sharedStyles'; 

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (password === confirmPassword) {
      // Navega a MainLayout en lugar de Login
      navigation.replace('MainLayout');
    } else {
      alert('Las contraseñas no coinciden');
    }
  };

  return (
    <View style={[tw`flex-1 bg-blue-500 items-center justify-center`, sharedStyles.bgCustomBlue]}>
      <Text style={tw`text-3xl font-bold text-white mb-2`}>Parking LP</Text>
      <Text style={tw`text-base text-white mb-8`}>Estacionamiento Inteligente</Text>
      <View style={tw`bg-white rounded-lg p-6 w-80`}>
        <Text style={tw`text-xl text-center font-bold mb-2`}>Crear Cuenta</Text>
        <Text style={tw`text-gray-600 text-center mb-4`}>Registrate para comenzar</Text>
        <Text style={tw`text-gray-800`} >Nombre Completo</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 mb-3`}
          placeholder="Juan Pérez"
          value={fullName}
          onChangeText={setFullName}
        />
        <Text style={tw`text-gray-800`} >Email</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 mb-3`}
          type="email-address"
          placeholder=" juanperez@gmail.com"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={tw`text-gray-800`} >Teléfono</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 mb-3`}
          placeholder=" 1136123-6485"
          value={phone}
          onChangeText={setPhone}
        />
        <Text style={tw`text-gray-800`} >Contraseña</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 mb-3`}
          placeholder="Tu Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Text style={tw`text-gray-800`} >Confirmar Contraseña</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 mb-4`}
          placeholder="Repite tu contraseña"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={[tw`rounded-lg py-3`, sharedStyles.bgCustomBlue]}
          onPress={handleRegister}
        >
          <Text style={tw`text-white text-center font-bold`}>Crear Cuenta</Text>
        </TouchableOpacity>
        <Text style={[tw`text-gray-600 mt-4 text-center`]}>¿Ya tienes cuenta? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={tw`mt-4`}
        >
          <Text style={[tw` text-center`, sharedStyles.textColorBlue]}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
      <View style={tw`absolute bottom-5 left-0 right-0 items-center`}>
            <Text style={tw`text-white text-xs`}>Municipalidad de La Plata • UTN</Text>
        </View>
    </View>
  );
}