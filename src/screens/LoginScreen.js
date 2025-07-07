import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import tw from '../utils/tailwind';
import sharedStyles from '../utils/sharedStyles'; 

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === '1234') {
      navigation.navigate('Home');
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <View style={[tw`flex-1 items-center justify-center`, sharedStyles.bgCustomBlue]}>
      <Text style={tw`text-3xl font-bold text-white mb-2`}>Parking LP</Text>
      <Text style={tw`text-lg text-white mb-8`}>Estacionamiento Inteligente</Text>
      <View style={tw`bg-white rounded-lg p-6 w-80`}>
        <Text style={tw`text-xl font-bold mb-4`}>Iniciar Sesión</Text>
        <Text style={tw`text-gray-600 mb-4`}>Accede a tu cuenta</Text>
        <TextInput
          style={tw`border border-gray-300 rounded px-4 py-2 mb-4`}
          placeholder="Teléfono o Email"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={tw`border border-gray-300 rounded px-4 py-2 mb-4`}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={tw`bg-blue-500 rounded py-2`}
          onPress={handleLogin}
        >
          <Text style={tw`text-white text-center font-bold`}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={tw`mt-4`}
        >
          <Text style={tw`text-blue-500 text-center`}>¿No tienes cuenta? Registrarse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}