import express from 'express';
import {
  getAllHerramientas,
  getHerramientaById,
  getHerramientasByMarca,
  createHerramienta,
  updateHerramienta,
  deleteHerramienta
} from '../controllers/herramienta.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registrarAccion } from '../middleware/bitacora.middleware.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticate);

// Rutas para herramientas
router.get('/', getAllHerramientas);
router.get('/marca/:marcaId', getHerramientasByMarca);
router.get('/:id', getHerramientaById);
router.post('/', registrarAccion('Herramienta', 'crear'), createHerramienta);
router.put('/:id', registrarAccion('Herramienta', 'editar'), updateHerramienta);
router.delete('/:id', registrarAccion('Herramienta', 'eliminar'), deleteHerramienta);

export default router;
