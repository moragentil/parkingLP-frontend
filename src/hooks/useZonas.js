import { useState, useEffect } from 'react';
import api from '../services/api';

export const useZonas = () => {
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarZonasParaMapa = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/zonas-mapa');
      
      if (response.data.status) {
        setZonas(response.data.zonas);
        return response.data.zonas;
      } else {
        throw new Error(response.data.message || 'Error cargando zonas');
      }
    } catch (error) {
      console.error('Error cargando zonas:', error);
      setError(error.message || 'Error de conexión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cargarZonasLeyenda = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/zonas-leyenda');
      
      if (response.data.status) {
        return response.data.leyenda;
      } else {
        throw new Error(response.data.message || 'Error cargando leyenda');
      }
    } catch (error) {
      console.error('Error cargando leyenda:', error);
      setError(error.message || 'Error de conexión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const buscarZonaPorUbicacion = (latitude, longitude) => {
    // Función para verificar si un punto está dentro de un polígono
    const pointInPolygon = (point, polygon) => {
      const x = point.latitude;
      const y = point.longitude;
      let inside = false;

      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].latitude;
        const yi = polygon[i].longitude;
        const xj = polygon[j].latitude;
        const yj = polygon[j].longitude;

        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
          inside = !inside;
        }
      }

      return inside;
    };

    for (const zona of zonas) {
      if (zona.poligonos && zona.poligonos.length > 0) {
        for (const poligono of zona.poligonos) {
          if (poligono.paths && poligono.paths.length >= 3) {
            const coordinates = poligono.paths.map(punto => ({
              latitude: punto.lat,
              longitude: punto.lng,
            }));
            
            if (pointInPolygon({ latitude, longitude }, coordinates)) {
              return zona;
            }
          }
        }
      }
    }

    return null;
  };

  return {
    zonas,
    loading,
    error,
    cargarZonasParaMapa,
    cargarZonasLeyenda,
    buscarZonaPorUbicacion,
  };
};