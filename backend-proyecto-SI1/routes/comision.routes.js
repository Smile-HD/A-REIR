import express from 'express';
import * as comisionController from '../controllers/comision.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registrarAccion } from '../middleware/bitacora.middleware.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticate);

// Rutas básicas CRUD
router.get('/', comisionController.getAllComisiones);
router.get('/:id', comisionController.getComisionById);
router.post('/', registrarAccion('Comisión', 'crear'), comisionController.createComision);
router.put('/:id', registrarAccion('Comisión', 'editar'), comisionController.updateComision);
router.delete('/:id', registrarAccion('Comisión', 'eliminar'), comisionController.deleteComision);

// Rutas especiales
router.get('/estado-pago/:estado', comisionController.getComisionesByEstadoPago);
router.get('/orden/:ordenId', comisionController.getComisionByOrden);
router.patch('/:id/pagar', registrarAccion('Comisión', 'marcar como pagada'), comisionController.marcarComoPagada);

export default router;
