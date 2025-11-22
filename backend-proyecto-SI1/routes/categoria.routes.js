import express from 'express';
import * as categoriaController from '../controllers/categoria.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registrarAccion } from '../middleware/bitacora.middleware.js';

const router = express.Router();

// GET /api/categorias - Obtener todas las categorías
router.get('/', authenticate, categoriaController.getAllCategorias);

// GET /api/categorias/:id - Obtener una categoría por ID
router.get('/:id', authenticate, categoriaController.getCategoriaById);

// POST /api/categorias - Crear una nueva categoría
router.post('/', authenticate, registrarAccion('Categoría', 'crear'), categoriaController.createCategoria);

export default router;
