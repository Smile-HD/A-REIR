import express from 'express';
import * as clienteController from '../controllers/cliente.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registrarAccion } from '../middleware/bitacora.middleware.js';

const router = express.Router();

// GET /api/clientes - Obtener todos los clientes
router.get('/', authenticate, clienteController.getAllClientes);

// GET /api/clientes/:ci - Obtener un cliente por CI
router.get('/:ci', authenticate, clienteController.getClienteById);

// POST /api/clientes - Crear un nuevo cliente
router.post('/', authenticate, registrarAccion('Cliente', 'crear'), clienteController.createCliente);

// PUT /api/clientes/:ci - Actualizar un cliente
router.put('/:ci', authenticate, registrarAccion('Cliente', 'editar'), clienteController.updateCliente);

// DELETE /api/clientes/:ci - Eliminar un cliente
router.delete('/:ci', authenticate, registrarAccion('Cliente', 'eliminar'), clienteController.deleteCliente);

export default router;
