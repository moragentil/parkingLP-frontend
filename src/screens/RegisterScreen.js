import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import tw from '../utils/tailwind';
import sharedStyles from '../utils/sharedStyles';
import api from '../services/api'; // Importa la instancia de axios
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validaciones básicas
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/register', {
        nombre: fullName,
        email: email,
        telefono: phone,
        password: password,
        password_confirmation: confirmPassword // Laravel requiere este campo para confirmed
      });

      if (response.data.status) {
        // Guardar token y datos del usuario
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        
        console.log('Registro exitoso:', response.data.message);
        
        Alert.alert(
          'Registro exitoso', 
          'Tu cuenta ha sido creada correctamente',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('MainLayout')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error en registro:', error);
      
      if (error.response?.data?.message) {
        Alert.alert('Error', error.response.data.message);
      } else if (error.response?.status === 422) {
        // Errores de validación
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        Alert.alert('Error de validación', errorMessages);
      } else if (error.message === 'Network Error') {
        Alert.alert('Error de conexión', 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.');
      } else {
        Alert.alert('Error', 'No se pudo registrar el usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[tw`flex-1 bg-blue-500 items-center justify-center`, sharedStyles.bgCustomBlue]}>
      <Text style={tw`text-3xl font-bold text-white mb-2`}>Parking LP</Text>
      <Text style={tw`text-base text-white mb-8`}>Estacionamiento Inteligente</Text>
      <View style={tw`bg-white rounded-lg p-6 w-80`}>
        <Text style={tw`text-xl text-center font-bold mb-2`}>Crear Cuenta</Text>
        <Text style={tw`text-gray-600 text-center mb-4`}>Registrate para comenzar</Text>
        
        <Text style={tw`text-gray-800`}>Nombre Completo</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 mb-3`}
          placeholder="Juan Pérez"
          value={fullName}
          onChangeText={setFullName}
          editable={!loading}
        />
        
        <Text style={tw`text-gray-800`}>Email</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 mb-3`}
          keyboardType="email-address"
          placeholder="juanperez@gmail.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          editable={!loading}
        />
        
        <Text style={tw`text-gray-800`}>Teléfono</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 mb-3`}
          placeholder="1136123-6485"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={!loading}
        />
        
        <Text style={tw`text-gray-800`}>Contraseña</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 mb-3`}
          placeholder="Tu Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        
        <Text style={tw`text-gray-800`}>Confirmar Contraseña</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 mb-4`}
          placeholder="Repite tu contraseña"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!loading}
        />
        
        <TouchableOpacity
          style={[
            tw`rounded-lg py-3`,
            sharedStyles.bgCustomBlue,
            loading ? tw`opacity-50` : tw``
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={tw`text-white text-center font-bold`}>
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </Text>
        </TouchableOpacity>
        
        <Text style={[tw`text-gray-600 mt-4 text-center`]}>¿Ya tienes cuenta? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={tw`mt-4`}
          disabled={loading}
        >
          <Text style={[tw`text-center`, sharedStyles.textColorBlue]}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
      
      <View style={tw`absolute bottom-5 left-0 right-0 items-center`}>
        <Text style={tw`text-white text-xs`}>Municipalidad de La Plata • UTN</Text>
      </View>
    </View>
  );
}