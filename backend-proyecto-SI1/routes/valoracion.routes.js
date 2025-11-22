import express from 'express';
import {
  getAllValoraciones,
  getEstadisticasValoraciones,
  crearValoracion,
  deleteValoracion
} from '../controllers/valoracion.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Ruta pública - crear valoración (sin autenticación)
router.post('/', crearValoracion);

// Rutas protegidas - solo para empleados autenticados
router.get('/', authenticate, getAllValoraciones);
router.get('/estadisticas', authenticate, getEstadisticasValoraciones);
router.delete('/:id', authenticate, deleteValoracion);

export default router;
