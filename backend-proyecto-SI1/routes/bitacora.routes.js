import express from 'express';
import { getBitacora, getEstadisticas, exportarBitacora } from '../controllers/bitacora.controller.js';
import { authenticate, checkPermission } from '../middleware/permission.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación y permiso de bitácora:ver
router.get('/', authenticate, checkPermission('bitacora:ver'), getBitacora);
router.get('/estadisticas', authenticate, checkPermission('bitacora:ver'), getEstadisticas);
router.get('/exportar', authenticate, checkPermission('bitacora:ver'), exportarBitacora);

export default router;
