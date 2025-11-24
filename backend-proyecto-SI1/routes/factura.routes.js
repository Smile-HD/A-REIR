import express from 'express';
import {
  getFacturas,
  getFacturaById,
  createFactura,
  updateFactura,
  anularFactura,
  deleteFactura,
  exportarFacturaPDF
} from '../controllers/factura.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Ruta de exportación PDF (sin middleware de autenticación general, valida token internamente)
router.get('/:nro/pdf', exportarFacturaPDF);

// Todas las demás rutas requieren autenticación
router.use(authenticate);

// Obtener todas las facturas
router.get('/', getFacturas);

// Obtener factura por número
router.get('/:nro', getFacturaById);

// Crear nueva factura
router.post('/', createFactura);

// Actualizar factura
router.put('/:nro', updateFactura);

// Anular factura
router.patch('/:nro/anular', anularFactura);

// Eliminar factura
router.delete('/:nro', deleteFactura);

export default router;
