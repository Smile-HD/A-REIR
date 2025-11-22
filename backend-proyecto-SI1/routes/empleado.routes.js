import express from 'express';
import * as empleadoController from '../controllers/empleado.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registrarAccion } from '../middleware/bitacora.middleware.js';

const router = express.Router();

// GET /api/empleados - Obtener todos los empleados
router.get('/', authenticate, empleadoController.getAllEmpleados);

// GET /api/empleados/:ci - Obtener un empleado por CI
router.get('/:ci', authenticate, empleadoController.getEmpleadoById);

// POST /api/empleados - Crear un nuevo empleado
router.post('/', authenticate, registrarAccion('Empleado', 'crear'), empleadoController.createEmpleado);

// PUT /api/empleados/:ci - Actualizar un empleado
router.put('/:ci', authenticate, registrarAccion('Empleado', 'editar'), empleadoController.updateEmpleado);

// DELETE /api/empleados/:ci - Eliminar un empleado
router.delete('/:ci', authenticate, registrarAccion('Empleado', 'eliminar'), empleadoController.deleteEmpleado);

export default router;
