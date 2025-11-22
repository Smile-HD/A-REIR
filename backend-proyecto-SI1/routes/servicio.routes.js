import express from 'express';
import * as servicioController from '../controllers/servicio.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registrarAccion } from '../middleware/bitacora.middleware.js';

const router = express.Router();

// GET /api/servicios - Obtener todos los servicios
router.get('/', authenticate, servicioController.getAllServicios);

// GET /api/servicios/:id - Obtener un servicio por ID
router.get('/:id', authenticate, servicioController.getServicioById);

// POST /api/servicios - Crear un nuevo servicio
router.post('/', authenticate, registrarAccion('Servicio', 'crear'), servicioController.createServicio);

// PUT /api/servicios/:id - Actualizar un servicio
router.put('/:id', authenticate, registrarAccion('Servicio', 'editar'), servicioController.updateServicio);

// DELETE /api/servicios/:id - Eliminar un servicio
router.delete('/:id', authenticate, registrarAccion('Servicio', 'eliminar'), servicioController.deleteServicio);

export default router;
