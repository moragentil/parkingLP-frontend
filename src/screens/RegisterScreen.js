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
      alert('Cuenta creada exitosamente');
      navigation.navigate('Login');
    } else {
      alert('Las contraseñas no coinciden');
    }
  };

  return (
    <View style={[tw`flex-1 bg-blue-500 items-center justify-center`, sharedStyles.bgCustomBlue]}>
      <Text style={tw`text-3xl font-bold text-white mb-2`}>Parking LP</Text>
      <Text style={tw`text-lg text-white mb-8`}>Estacionamiento Inteligente</Text>
      <View style={tw`bg-white rounded-lg p-6 w-80`}>
        <Text style={tw`text-xl font-bold mb-4`}>Crear Cuenta</Text>
        <Text style={tw`text-gray-600 mb-4`}>Regístrate para comenzar</Text>
        <TextInput
          style={tw`border border-gray-300 rounded px-4 py-2 mb-4`}
          placeholder="Nombre Completo"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={tw`border border-gray-300 rounded px-4 py-2 mb-4`}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={tw`border border-gray-300 rounded px-4 py-2 mb-4`}
          placeholder="Teléfono"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={tw`border border-gray-300 rounded px-4 py-2 mb-4`}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={tw`border border-gray-300 rounded px-4 py-2 mb-4`}
          placeholder="Confirmar Contraseña"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={tw`bg-blue-500 rounded py-2`}
          onPress={handleRegister}
        >
          <Text style={tw`text-white text-center font-bold`}>Crear Cuenta</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={tw`mt-4`}
        >
          <Text style={tw`text-blue-500 text-center`}>¿Ya tienes cuenta? Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}