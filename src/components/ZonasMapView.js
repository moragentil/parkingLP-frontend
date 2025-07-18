import React, { useState, useEffect } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../services/api';

export default function ZonasMapView({ 
  style, 
  initialRegion, 
  showUserLocation = true,
  onMapPress,
  children 
}) {
  const [location, setLocation] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [loadingZonas, setLoadingZonas] = useState(true);
  const [mapRegion, setMapRegion] = useState(
    initialRegion || {
      latitude: -34.9214, // La Plata por defecto
      longitude: -57.9544,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }
  );

  useEffect(() => {
    if (showUserLocation) {
      getCurrentLocation();
    }
    cargarZonasParaMapa();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permisos de ubicación no concedidos');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;
      
      setLocation(currentLocation.coords);
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
    }
  };

  const cargarZonasParaMapa = async () => {
    try {
      setLoadingZonas(true);
      const response = await api.get('/zonas-mapa');
      
      if (response.data.status) {
        setZonas(response.data.zonas);
        console.log('Zonas para mapa cargadas:', response.data.zonas.length);
      } else {
        console.error('Error cargando zonas:', response.data.message);
      }
    } catch (error) {
      console.error('Error cargando zonas para mapa:', error);
      if (error.response?.status === 401) {
        console.warn('Sesión expirada');
      }
    } finally {
      setLoadingZonas(false);
    }
  };

  const getColorFromHex = (hexColor, alpha = 0.3) => {
    // Convertir color hex a rgba para transparencia
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getStrokeColorFromHex = (hexColor) => {
    // Color más oscuro para el borde
    const hex = hexColor.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 40);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 40);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 40);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    // Actualizar ubicación si es necesario
    if (showUserLocation) {
      setLocation({ latitude, longitude });
      setMapRegion({
        ...mapRegion,
        latitude,
        longitude,
      });
    }

    // Llamar callback personalizado si existe
    if (onMapPress) {
      onMapPress(event);
    }
  };

  const renderZonaPolygons = () => {
    return zonas.map((zona) => {
      if (!zona.poligonos || zona.poligonos.length === 0) {
        return null;
      }

      return zona.poligonos.map((poligono) => {
        if (!poligono.paths || poligono.paths.length < 3) {
          return null;
        }

        const coordinates = poligono.paths.map(punto => ({
          latitude: punto.lat,
          longitude: punto.lng,
        }));

        const fillColor = zona.es_prohibido_estacionar 
          ? 'rgba(220, 38, 127, 0.3)' // Rosa/rojo para prohibido
          : getColorFromHex(zona.color_mapa, 0.3);

        const strokeColor = zona.es_prohibido_estacionar
          ? 'rgb(180, 20, 100)'
          : getStrokeColorFromHex(zona.color_mapa);

        return (
          <Polygon
            key={`${zona.id}-${poligono.id}`}
            coordinates={coordinates}
            fillColor={fillColor}
            strokeColor={strokeColor}
            strokeWidth={2}
            tappable={true}
            onPress={() => {
              Alert.alert(
                zona.nombre,
                `Tipo: ${zona.tipo}\n${zona.descripcion || 'Sin descripción'}`,
                [{ text: 'OK' }]
              );
            }}
          />
        );
      });
    });
  };

  const renderZonaCentroides = () => {
    return zonas
      .filter(zona => zona.centroide && zona.centroide.lat && zona.centroide.lng)
      .map((zona) => (
        <Marker
          key={`centroide-${zona.id}`}
          coordinate={{
            latitude: zona.centroide.lat,
            longitude: zona.centroide.lng,
          }}
          title={zona.nombre}
          description={`${zona.tipo} - ${zona.descripcion || 'Sin descripción'}`}
          pinColor={zona.es_prohibido_estacionar ? 'red' : 'blue'}
        />
      ));
  };

  return (
    <View style={style}>
      <MapView
        style={{ flex: 1 }}
        region={mapRegion}
        onPress={handleMapPress}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={showUserLocation}
        mapType="standard"
      >
        {/* Renderizar polígonos de zonas */}
        {!loadingZonas && renderZonaPolygons()}
        
        {/* Renderizar centroides de zonas como markers */}
        {!loadingZonas && renderZonaCentroides()}

        {/* Marker de ubicación del usuario (si se proporciona manualmente) */}
        {location && showUserLocation && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Tu ubicación"
            description="Ubicación actual"
            pinColor="green"
          />
        )}

        {/* Children adicionales (otros markers, etc.) */}
        {children}
      </MapView>

      {/* Indicador de carga */}
      {loadingZonas && (
        <View style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: 'white',
          padding: 8,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
          <ActivityIndicator size="small" color="#3236FF" />
        </View>
      )}
    </View>
  );
}