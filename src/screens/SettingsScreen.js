import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import tw from '../utils/tailwind';
import Ionicons from 'react-native-vector-icons/Ionicons';
import sharedStyles from '../utils/sharedStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function SettingsScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const cargarDatosUsuario = async () => {
    try {
      setLoading(true);
      
      // Primero intentar obtener del storage local
      const usuarioLocal = await AsyncStorage.getItem('usuario');
      if (usuarioLocal) {
        const usuario = JSON.parse(usuarioLocal);
        setFullName(usuario.nombre || '');
        setEmail(usuario.email || '');
        setPhone(usuario.telefono || '');
      }

      // Luego obtener datos actuales del servidor
      const response = await api.get('/me');
      
      if (response.data.status) {
        const usuario = response.data.usuario;
        setFullName(usuario.nombre || '');
        setEmail(usuario.email || '');
        setPhone(usuario.telefono || '');
        
        // Actualizar el storage local con datos frescos
        await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
      if (error.response?.status === 401) {
        Alert.alert('Sesión expirada', 'Por favor inicia sesión nuevamente.');
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Error', 'El nombre y email son obligatorios');
      return;
    }

    setSaving(true);
    
    try {
      const response = await api.put('/usuarios/me/perfil', {
        nombre: fullName.trim(),
        email: email.trim(),
        telefono: phone.trim() || null
      });

      if (response.data.status) {
        // Actualizar el storage local
        const usuarioActualizado = response.data.usuario;
        await AsyncStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
        
        Alert.alert('Éxito', response.data.message || 'Perfil actualizado correctamente');
      } else {
        Alert.alert('Error', response.data.message || 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error guardando cambios:', error);
      
      if (error.response?.status === 422) {
        // Errores de validación
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        Alert.alert('Error de validación', errorMessages);
      } else if (error.response?.status === 401) {
        Alert.alert('Sesión expirada', 'Por favor inicia sesión nuevamente.');
        handleLogout();
      } else {
        Alert.alert('Error', error.response?.data?.message || 'No se pudo actualizar el perfil');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              // Intentar hacer logout en el servidor
              await api.post('/logout');
            } catch (error) {
              console.log('Error al hacer logout en servidor:', error);
              // No mostramos error al usuario, continuamos limpiando local
            } finally {
              // Limpiar datos del storage local
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('usuario');
              
              // Navegar al login
              navigation.navigate('Login');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-gray-100 justify-center items-center`}>
        <ActivityIndicator size="large" color="#3236FF" />
        <Text style={tw`mt-2 text-gray-600`}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={tw`flex-1 bg-gray-100`} contentContainerStyle={tw`p-4 pb-24`}>
      {/* Sección de Perfil */}
      <View style={tw`bg-white p-4 rounded-lg shadow mb-4`}>
        <Text style={tw`text-xl font-bold mb-4 text-gray-800`}>Mi Perfil</Text>
        <View style={tw`flex-row items-center mb-4`}>
          <Ionicons name="person-circle-outline" size={64} style={sharedStyles.textColorBlue} />
          <View style={tw`ml-4 flex-1`}>
            <Text style={tw`text-lg font-semibold`} numberOfLines={1}>{fullName || 'Usuario'}</Text>
            <Text style={tw`text-gray-500`} numberOfLines={1}>{email || 'Sin email'}</Text>
            {phone && (
              <Text style={tw`text-gray-400 text-sm`} numberOfLines={1}>{phone}</Text>
            )}
          </View>
        </View>
        
        <Text style={tw`text-gray-600 mb-2`}>Nombre Completo *</Text>
        <TextInput
          style={tw`border border-gray-300 rounded px-4 py-2 mb-4`}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Ingresa tu nombre completo"
          editable={!saving}
        />
        
        <Text style={tw`text-gray-600 mb-2`}>Email *</Text>
        <TextInput
          style={tw`border border-gray-300 rounded px-4 py-2 mb-4`}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="tu@email.com"
          autoCapitalize="none"
          editable={!saving}
        />

        <Text style={tw`text-gray-600 mb-2`}>Teléfono</Text>
        <TextInput
          style={tw`border border-gray-300 rounded px-4 py-2 mb-4`}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="11 1234-5678"
          editable={!saving}
        />

        <TouchableOpacity
          style={[
            tw`py-3 rounded-lg`,
            sharedStyles.bgCustomBlue,
            saving ? tw`opacity-50` : tw``
          ]}
          onPress={handleSaveChanges}
          disabled={saving}
        >
          {saving ? (
            <View style={tw`flex-row justify-center items-center`}>
              <ActivityIndicator size="small" color="white" />
              <Text style={tw`text-white text-center font-bold ml-2`}>Guardando...</Text>
            </View>
          ) : (
            <Text style={tw`text-white text-center font-bold`}>Guardar Cambios</Text>
          )}
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