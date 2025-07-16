import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import tw from '../utils/tailwind';
import sharedStyles from '../utils/sharedStyles';
import api from '../services/api'; // Importa la instancia de axios

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState(''); // Cambiado de username a email
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/login', {
        email: email,
        password: password
      });

      if (response.data.status) {
        // Guardar token y datos del usuario (opcional)
        // await AsyncStorage.setItem('token', response.data.token);
        // await AsyncStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        
        console.log('Login exitoso:', response.data.message);
        navigation.replace('MainLayout');
      }
    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.response?.data?.message) {
        Alert.alert('Error', error.response.data.message);
      } else if (error.response?.status === 422) {
        // Errores de validación
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        Alert.alert('Error de validación', errorMessages);
      } else {
        Alert.alert('Error', 'No se pudo conectar con el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[tw`flex-1 items-center justify-center`, sharedStyles.bgCustomBlue]}>
      <Text style={tw`text-3xl font-bold text-white mb-2`}>Parking LP</Text>
      <Text style={tw`text-base text-white mb-8`}>Estacionamiento Inteligente</Text>
      <View style={tw`bg-white rounded-lg p-6 w-80`}>
        <Text style={tw`text-2xl text-gray-800 text-center font-bold mb-2`}>Iniciar Sesión</Text>
        <Text style={tw`text-gray-600 text-center mb-4`}>Accede a tu cuenta</Text>
        <Text style={tw`text-gray-800`}>Email</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 mb-4`}
          placeholder="juan@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        <Text style={tw`text-gray-800`}>Contraseña</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 mb-4`}
          placeholder="Tu contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        <TouchableOpacity
          style={[
            tw`rounded-lg py-3`,
            sharedStyles.bgCustomBlue,
            loading ? tw`opacity-50` : tw``
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={tw`text-white text-center font-bold`}>
            {loading ? 'Iniciando...' : 'Entrar'}
          </Text>
        </TouchableOpacity>
        <Text style={[tw`text-gray-600 mt-4 text-center`]}>¿No tienes cuenta? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={tw`mt-4`}
          disabled={loading}
        >
          <Text style={[tw`text-center`, sharedStyles.textColorBlue]}>Registrate</Text>
        </TouchableOpacity>
      </View>
      <View style={tw`absolute bottom-5 left-0 right-0 items-center`}>
        <Text style={tw`text-white text-xs`}>Municipalidad de La Plata • UTN</Text>
      </View>
    </View>
  );
}