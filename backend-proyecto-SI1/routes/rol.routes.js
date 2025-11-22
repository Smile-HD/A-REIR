import express from 'express';
import * as rolController from '../controllers/rol.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registrarAccion } from '../middleware/bitacora.middleware.js';

const router = express.Router();

// GET /api/roles - Obtener todos los roles
router.get('/', authenticate, rolController.getAllRoles);

// GET /api/roles/:id - Obtener un rol por ID
router.get('/:id', authenticate, rolController.getRolById);

// POST /api/roles - Crear un nuevo rol
router.post('/', authenticate, registrarAccion('Rol', 'crear'), rolController.createRol);

// PUT /api/roles/:id - Actualizar un rol
router.put('/:id', authenticate, registrarAccion('Rol', 'editar'), rolController.updateRol);

// DELETE /api/roles/:id - Eliminar un rol
router.delete('/:id', authenticate, registrarAccion('Rol', 'eliminar'), rolController.deleteRol);

// POST /api/roles/:id/permisos - Asignar permisos a un rol
router.post('/:id/permisos', authenticate, registrarAccion('Rol-Permisos', 'asignar'), rolController.assignPermisosToRol);

export default router;
