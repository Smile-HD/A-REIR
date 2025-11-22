import express from 'express';
import * as motoController from '../controllers/moto.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registrarAccion } from '../middleware/bitacora.middleware.js';

const router = express.Router();

// GET /api/motos - Obtener todas las motos
router.get('/', authenticate, motoController.getAllMotos);

// GET /api/motos/marcas - Obtener todas las marcas
router.get('/marcas', authenticate, motoController.getAllMarcas);

// GET /api/motos/:placa - Obtener una moto por placa
router.get('/:placa', authenticate, motoController.getMotoById);

// POST /api/motos - Crear una nueva moto
router.post('/', authenticate, registrarAccion('Moto', 'crear'), motoController.createMoto);

// PUT /api/motos/:placa - Actualizar una moto
router.put('/:placa', authenticate, registrarAccion('Moto', 'editar'), motoController.updateMoto);

// DELETE /api/motos/:placa - Eliminar una moto
router.delete('/:placa', authenticate, registrarAccion('Moto', 'eliminar'), motoController.deleteMoto);

export default router;
