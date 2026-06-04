import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Configuración automática de URL de la API según el entorno
 * - Web (PC): http://localhost:3000/api
 * - Móvil (Android/iOS): http://192.168.1.126:3000/api (desde app.json)
 * - Producción: https://noteflow-eight-iota.vercel.app/api
 */

const EXTRA = (Constants as any)?.expoConfig?.extra || {};

const API_CONFIG = {
  // URL de producción (Vercel)
  PRODUCTION: 'https://noteflow-eight-iota.vercel.app/api',
  
  // URL para web (PC - localhost)
  WEB: 'http://localhost:3000/api',
  
  // URL para móvil (desde app.json)
  MOBILE: (EXTRA.DEV_API_URL as string) || 'http://192.168.1.126:3000/api',
};

/**
 * Obtiene la URL de la API según el entorno actual
 */
export const getApiUrl = (): string => {
  // En desarrollo, selecciona según la plataforma
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return API_CONFIG.WEB;
    } else {
      return API_CONFIG.MOBILE;
    }
  }
  
  // En producción
  return API_CONFIG.PRODUCTION;
};

// Exporta la URL actual
export const API_URL = getApiUrl();

// Exporta configuración para acceso directo si es necesario
export const apiConfig = {
  getUrl: getApiUrl,
  production: API_CONFIG.PRODUCTION,
  web: API_CONFIG.WEB,
  mobile: API_CONFIG.MOBILE,
  current: API_URL,
  platform: Platform.OS,
  isDev: __DEV__,
};

export default API_URL;
