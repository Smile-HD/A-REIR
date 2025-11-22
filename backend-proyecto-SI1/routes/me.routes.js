import express from 'express';
import { getUserPermissions, checkUserPermission } from '../controllers/permisoUsuario.controller.js';
import { authenticate } from '../middleware/permission.middleware.js';

const router = express.Router();

// GET /api/me/permissions - Obtener permisos del usuario actual
router.get('/permissions', authenticate, getUserPermissions);

// GET /api/me/permissions/check/:permiso - Verificar si tiene un permiso específico
router.get('/permissions/check/:permiso', authenticate, checkUserPermission);

export default router;
