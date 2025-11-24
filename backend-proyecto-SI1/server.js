import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usuarioRoutes from './routes/usuario.routes.js';
import rolRoutes from './routes/rol.routes.js';
import permisoRoutes from './routes/permiso.routes.js';
import authRoutes from './routes/auth.routes.js';
import empleadoRoutes from './routes/empleado.routes.js';
import motoRoutes from './routes/moto.routes.js';
import diagnosticoRoutes from './routes/diagnostico.routes.js';
import clienteRoutes from './routes/cliente.routes.js';
import servicioRoutes from './routes/servicio.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import proformaRoutes from './routes/proforma.routes.js';
import horarioRoutes from './routes/horario.routes.js';
import ordenTrabajoRoutes from './routes/ordenTrabajo.routes.js';
import comisionRoutes from './routes/comision.routes.js';
import marcaHerramientaRoutes from './routes/marcaHerramienta.routes.js';
import herramientaRoutes from './routes/herramienta.routes.js';
import movimientoHerramientaRoutes from './routes/movimientoHerramienta.routes.js';
import bitacoraRoutes from './routes/bitacora.routes.js';
import meRoutes from './routes/me.routes.js';
import reporteRoutes from './routes/reporte.routes.js';
import valoracionRoutes from './routes/valoracion.routes.js';
import facturaRoutes from './routes/factura.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Express para confiar en proxies (importante para obtener IP real)
app.set('trust proxy', true);


// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging de IP (debug)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📍 IP Debug:', {
      'x-real-ip': req.headers['x-real-ip'],
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'req.ip': req.ip,
      'remoteAddress': req.socket?.remoteAddress
    });
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/permisos', permisoRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/motos', motoRoutes);
app.use('/api/diagnosticos', diagnosticoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/proformas', proformaRoutes);
app.use('/api/horarios', horarioRoutes);
app.use('/api/ordenes-trabajo', ordenTrabajoRoutes);
app.use('/api/comisiones', comisionRoutes);
app.use('/api/marcas-herramienta', marcaHerramientaRoutes);
app.use('/api/herramientas', herramientaRoutes);
app.use('/api/movimientos-herramienta', movimientoHerramientaRoutes);
app.use('/api/bitacora', bitacoraRoutes);
app.use('/api/me', meRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/valoraciones', valoracionRoutes);
app.use('/api/facturas', facturaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend funcionando correctamente' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👔 Empleados API: http://localhost:${PORT}/api/empleados`);
});
