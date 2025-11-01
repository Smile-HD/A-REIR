const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const adminMiddleware = require('../../middlewares/adminMiddleware');
const {
  createUsuario,
  getAllUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
  searchUsuarios,
  cambiarContrasena,
  promoverAdministrador,
  degradarAdministrador
} = require('../../controllers/Administracion/usuarioController');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);
// Aplicar middleware de administrador a todas las rutas de usuarios
router.use(adminMiddleware);

// Rutas CRUD para usuarios
router.post('/', createUsuario);                    // Crear usuario
router.get('/', getAllUsuarios);                    // Obtener todos los usuarios con paginación
router.get('/search', searchUsuarios);              // Buscar usuarios
router.get('/:id', getUsuarioById);                 // Obtener usuario por ID
router.put('/:id', updateUsuario);                  // Actualizar usuario
router.delete('/:id', deleteUsuario);               // Eliminar usuario
router.put('/:id/cambiar-contrasena', cambiarContrasena); // Cambiar contraseña
router.put('/:id/promover-admin', promoverAdministrador); // Promover a administrador
router.put('/:id/degradar-admin', degradarAdministrador); // Degradar de administrador

module.exports = router;