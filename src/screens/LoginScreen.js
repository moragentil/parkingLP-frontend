import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import tw from '../utils/tailwind';
import sharedStyles from '../utils/sharedStyles'; 

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === '1234') {
      navigation.replace('MainLayout');
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <View style={[tw`flex-1 items-center justify-center`, sharedStyles.bgCustomBlue]}>
      <Text style={tw`text-3xl font-bold text-white mb-2`}>Parking LP</Text>
      <Text style={tw`text-base text-white mb-8`}>Estacionamiento Inteligente</Text>
      <View style={tw`bg-white  rounded-lg p-6 w-80`}>
        <Text style={tw`text-2xl text-gray-800 text-center font-bold mb-2`}>Iniciar Sesión</Text>
        <Text style={tw`text-gray-600 text-center mb-4`}>Accede a tu cuenta</Text>
        <Text style={tw`text-gray-800 `} >Teléfono o Email</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 mb-4`}
          placeholder="11361236485 o juan@gmail.com"
          value={username}
          onChangeText={setUsername}
        />
        <Text style={tw`text-gray-800`} >Contraseña</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 mb-4`}
          placeholder="Tu contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={[tw` rounded-lg py-3`, sharedStyles.bgCustomBlue]}
          onPress={handleLogin}
        >
          <Text style={tw`text-white text-center font-bold`}>Entrar</Text>
        </TouchableOpacity>
        <Text style={[tw`text-gray-600 mt-4 text-center`]}>¿No tienes cuenta? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={tw`mt-4`}
        >
          <Text style={[tw` text-center`, sharedStyles.textColorBlue]}>Registrate</Text>
        </TouchableOpacity>
      </View>
      <View style={tw`absolute bottom-5 left-0 right-0 items-center`}>
            <Text style={tw`text-white text-xs`}>Municipalidad de La Plata • UTN</Text>
        </View>
    </View>
  );
}