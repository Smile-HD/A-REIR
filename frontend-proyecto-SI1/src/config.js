// ============================================================
// CONFIGURACIÓN DEL SERVIDOR BACKEND
// ============================================================
// Para cambiar el servidor backend, modifica la URL aquí abajo:

// Cuando subas tu backend a Render, reemplaza con tu URL de Render:
export const API_URL = 'https://backend-si1-hqtg.onrender.com/api'

// Ejemplos de otras URLs que puedes usar:
// export const API_URL = 'http://192.168.1.100:3000/api'  // Servidor en red local
 // export const API_URL = 'http://localhost:3000/api'       // Desarrollo local

// ============================================================
// CONFIGURACIÓN GENERAL DE LA APLICACIÓN
// ============================================================

export const config = {
  apiUrl: API_URL,
  tokenKey: 'token',
  userEmailKey: 'userEmail',
  isAuthenticatedKey: 'isAuthenticated',
  tokenExpirationTime: 24 * 60 * 60 * 1000, // 24 horas
}

export default config;
