import express from 'express';
import * as permisoController from '../controllers/permiso.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registrarAccion } from '../middleware/bitacora.middleware.js';

const router = express.Router();

// GET /api/permisos - Obtener todos los permisos
router.get('/', authenticate, permisoController.getAllPermisos);

// GET /api/permisos/:id - Obtener un permiso por ID
router.get('/:id', authenticate, permisoController.getPermisoById);

// POST /api/permisos - Crear un nuevo permiso
router.post('/', authenticate, registrarAccion('Permiso', 'crear'), permisoController.createPermiso);

// PUT /api/permisos/:id - Actualizar un permiso
router.put('/:id', authenticate, registrarAccion('Permiso', 'editar'), permisoController.updatePermiso);

// DELETE /api/permisos/:id - Eliminar un permiso
router.delete('/:id', authenticate, registrarAccion('Permiso', 'eliminar'), permisoController.deletePermiso);

export default router;
