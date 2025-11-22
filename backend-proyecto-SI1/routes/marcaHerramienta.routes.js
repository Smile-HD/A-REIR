import express from 'express';
import {
  getAllMarcasHerramienta,
  getMarcaHerramientaById,
  createMarcaHerramienta,
  updateMarcaHerramienta,
  deleteMarcaHerramienta
} from '../controllers/marcaHerramienta.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registrarAccion } from '../middleware/bitacora.middleware.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticate);

// Rutas para marcas de herramientas
router.get('/', getAllMarcasHerramienta);
router.get('/:id', getMarcaHerramientaById);
router.post('/', registrarAccion('Marca de Herramienta', 'crear'), createMarcaHerramienta);
router.put('/:id', registrarAccion('Marca de Herramienta', 'editar'), updateMarcaHerramienta);
router.delete('/:id', registrarAccion('Marca de Herramienta', 'eliminar'), deleteMarcaHerramienta);

export default router;
