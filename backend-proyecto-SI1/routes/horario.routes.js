import express from 'express';
import * as horarioController from '../controllers/horario.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registrarAccion } from '../middleware/bitacora.middleware.js';

const router = express.Router();

// Rutas de horarios
router.get('/', authenticate, horarioController.getAllHorarios);
router.get('/semana', authenticate, horarioController.getHorariosSemana);
router.get('/empleados', authenticate, horarioController.getHorariosEmpleados);
router.get('/:id', authenticate, horarioController.getHorarioById);
router.post('/', authenticate, registrarAccion('Horario', 'crear'), horarioController.createHorario);
router.put('/:id', authenticate, registrarAccion('Horario', 'editar'), horarioController.updateHorario);
router.delete('/:id', authenticate, registrarAccion('Horario', 'eliminar'), horarioController.deleteHorario);

// Rutas de asignación de horarios a empleados
router.post('/asignar', authenticate, registrarAccion('Horario-Empleado', 'asignar'), horarioController.asignarHorarioEmpleado);
router.delete('/asignar/:empleadoCi/:horarioId', authenticate, registrarAccion('Horario-Empleado', 'eliminar asignación'), horarioController.eliminarHorarioEmpleado);

export default router;
