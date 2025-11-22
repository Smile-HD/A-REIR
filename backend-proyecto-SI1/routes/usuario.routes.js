import express from 'express';
import * as usuarioController from '../controllers/usuario.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registrarAccion } from '../middleware/bitacora.middleware.js';

const router = express.Router();

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', authenticate, usuarioController.getAllUsuarios);

// GET /api/usuarios/:id - Obtener un usuario por ID
router.get('/:id', authenticate, usuarioController.getUsuarioById);

// POST /api/usuarios - Crear un nuevo usuario
router.post('/', authenticate, registrarAccion('Usuario', 'crear'), usuarioController.createUsuario);

// PUT /api/usuarios/:id - Actualizar un usuario
router.put('/:id', authenticate, registrarAccion('Usuario', 'editar'), usuarioController.updateUsuario);

// DELETE /api/usuarios/:id - Eliminar un usuario
router.delete('/:id', authenticate, registrarAccion('Usuario', 'eliminar'), usuarioController.deleteUsuario);

export default router;
