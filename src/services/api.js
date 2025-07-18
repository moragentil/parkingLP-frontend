import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Función para obtener la URL base según el entorno
const getBaseURL = () => {
  if (__DEV__) {
    // Para desarrollo
    if (Platform.OS === 'android') {
      // Emulador Android usa esta IP especial para localhost
      return 'http://10.0.2.2:8000/api';
    } else if (Platform.OS === 'ios') {
      // iOS Simulator puede usar localhost SOLO si usas el simulador de iOS
      // Si usas Expo Go en dispositivo físico, usa tu IP local
      return 'http://192.168.1.35:8000/api'; // Tu IP de Wi-Fi
    } else {
      // Web o Expo Go en dispositivo físico
      return 'http://127.0.0.1:8000/api'; // Tu IP de Wi-Fi
    }
  } else {
    // Producción
    return 'https://tu-backend-produccion.com/api';
  }
};

const BASE_URL = getBaseURL();

console.log('API Base URL:', BASE_URL); // Para debug

// Crear instancia de axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para requests - agregar token de autenticación
api.interceptors.request.use(
  async (config) => {
    // Agregar el token de autenticación si existe
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejar errores globalmente
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('Response Error:', error.response?.status, error.response?.data);
    
    // Manejar errores específicos
    if (error.response?.status === 401) {
      // Token expirado o no válido - limpiar storage y redirigir
      console.log('Token inválido, limpiando datos de usuario');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario');
      // Aquí necesitarías redirigir al login
    }
    
    if (error.response?.status >= 500) {
      console.error('Error del servidor');
    }
    
    return Promise.reject(error);
  }
);

export default api;