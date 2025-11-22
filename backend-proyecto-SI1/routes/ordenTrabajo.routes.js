import express from 'express';
import * as ordenTrabajoController from '../controllers/ordenTrabajo.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registrarAccion } from '../middleware/bitacora.middleware.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticate);

// Rutas básicas CRUD
router.get('/', ordenTrabajoController.getAllOrdenesTrabajo);
router.get('/:id', ordenTrabajoController.getOrdenTrabajoById);
router.post('/', registrarAccion('Orden de Trabajo', 'crear'), ordenTrabajoController.createOrdenTrabajo);
router.put('/:id', registrarAccion('Orden de Trabajo', 'editar'), ordenTrabajoController.updateOrdenTrabajo);
router.delete('/:id', registrarAccion('Orden de Trabajo', 'eliminar'), ordenTrabajoController.deleteOrdenTrabajo);

// Rutas especiales
router.get('/empleado/:empleadoCi', ordenTrabajoController.getOrdenesByEmpleado);
router.get('/estado/:estado', ordenTrabajoController.getOrdenesByEstado);

export default router;
