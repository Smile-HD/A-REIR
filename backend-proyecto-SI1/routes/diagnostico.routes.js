import express from 'express';
import * as diagnosticoController from '../controllers/diagnostico.controller.js';
import { authenticate, checkPermission } from '../middleware/permission.middleware.js';
import { registrarAccion } from '../middleware/bitacora.middleware.js';

const router = express.Router();

// GET /api/diagnosticos - Obtener todos los diagnósticos
router.get('/', authenticate, checkPermission('diagnosticos:ver'), diagnosticoController.getAllDiagnosticos);

// GET /api/diagnosticos/:nro - Obtener un diagnóstico por NRO
router.get('/:nro', authenticate, checkPermission('diagnosticos:ver'), diagnosticoController.getDiagnosticoById);

// POST /api/diagnosticos - Crear un nuevo diagnóstico con detalles
router.post('/', authenticate, checkPermission('diagnosticos:crear'), registrarAccion('Diagnóstico', 'crear'), diagnosticoController.createDiagnostico);

// PUT /api/diagnosticos/:nro - Actualizar un diagnóstico con detalles
router.put('/:nro', authenticate, checkPermission('diagnosticos:editar'), registrarAccion('Diagnóstico', 'editar'), diagnosticoController.updateDiagnostico);

// DELETE /api/diagnosticos/:nro - Eliminar un diagnóstico
router.delete('/:nro', authenticate, checkPermission('diagnosticos:eliminar'), registrarAccion('Diagnóstico', 'eliminar'), diagnosticoController.deleteDiagnostico);

export default router;
