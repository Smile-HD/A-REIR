// ============================================================
// CONFIGURACIÓN DEL SERVIDOR BACKEND
// ============================================================
// Para cambiar el servidor backend, modifica la URL aquí abajo:

//export const API_URL = 'https://backend-multiservicio-w9s2g.ondigitalocean.app/api'

// Ejemplos de otras URLs que puedes usar:
// export const API_URL = 'http://192.168.1.100:3000/api'  // Servidor en red local
// export const API_URL = 'https://tu-servidor.com/api'     // Servidor en producción
 export const API_URL = 'http://localhost:3000/api'       // Otro puerto local

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
