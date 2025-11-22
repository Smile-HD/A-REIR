import { Router } from 'express';
import {
  reporteClientesFrecuentes,
  reporteServiciosSolicitados,
  reporteIngresosMensuales,
  reporteEmpleadosProductividad,
  reporteMarcasMotos,
  reporteActividadEmpleados,
  exportarClientesExcel,
  exportarClientesPDF,
  exportarServiciosExcel,
  exportarServiciosPDF,
  exportarIngresosExcel,
  exportarIngresosPDF,
  exportarActividadEmpleadosExcel,
  exportarActividadEmpleadosPDF
} from '../controllers/reporte.controller.js';
import { authenticate, checkPermission } from '../middleware/permission.middleware.js';

const router = Router();

// ==========================================
// RUTAS DE REPORTES (JSON) - Requieren autenticación
// ==========================================

// Reporte de clientes frecuentes
router.get('/clientes-frecuentes', authenticate, reporteClientesFrecuentes);

// Reporte de servicios más solicitados
router.get('/servicios-solicitados', authenticate, reporteServiciosSolicitados);

// Reporte de ingresos mensuales
router.get('/ingresos-mensuales', authenticate, reporteIngresosMensuales);

// Reporte de productividad de empleados
router.get('/empleados-productividad', authenticate, reporteEmpleadosProductividad);

// Reporte de marcas de motos más atendidas
router.get('/marcas-motos', authenticate, reporteMarcasMotos);

// Reporte de actividad de empleados
router.get('/actividad-empleados', authenticate, reporteActividadEmpleados);

// ==========================================
// RUTAS DE EXPORTACIÓN - Sin middleware (validan token internamente)
// ==========================================

// Exportar clientes frecuentes
router.get('/export/clientes-excel', exportarClientesExcel);
router.get('/export/clientes-pdf', exportarClientesPDF);

// Exportar servicios solicitados
router.get('/export/servicios-excel', exportarServiciosExcel);
router.get('/export/servicios-pdf', exportarServiciosPDF);

// Exportar ingresos mensuales
router.get('/export/ingresos-excel', exportarIngresosExcel);
router.get('/export/ingresos-pdf', exportarIngresosPDF);

// Exportar actividad de empleados
router.get('/export/actividad-empleados-excel', exportarActividadEmpleadosExcel);
router.get('/export/actividad-empleados-pdf', exportarActividadEmpleadosPDF);

export default router;
