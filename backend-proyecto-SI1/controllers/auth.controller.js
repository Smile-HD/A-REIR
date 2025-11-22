import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import BitacoraService from '../services/bitacora.service.js';

/**
 * Función para normalizar la IP y obtener la IP real del cliente
 */
const normalizarIP = (req) => {
  let ip = 
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'IP desconocida';
  
  if (ip.includes('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  if (ip === '::1') {
    ip = '127.0.0.1';
  }
  return ip;
};

// Login de usuario
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario por email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        rol: {
          include: {
            permisos: {
              include: {
                permiso: true
              }
            }
          }
        }
      }
    });

    if (!usuario) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValida) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Registrar en bitácora
    const ipOrigen = normalizarIP(req);
    await BitacoraService.registrarLogin(usuario.id, usuario.username, ipOrigen);

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        username: usuario.username,
        rolId: usuario.idRol
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Preparar permisos
    const permisos = usuario.rol?.permisos.map(rp => rp.permiso.nombre) || [];

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        rol: usuario.rol?.nombre || null,
        permisos
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión',
      details: error.message 
    });
  }
};

// Registro de usuario
export const register = async (req, res) => {
  try {
    const { username, email, password, idRol } = req.body;

    // Validar campos requeridos
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email y contraseña son requeridos' 
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (usuarioExistente) {
      return res.status(400).json({ 
        error: 'El email o username ya está registrado' 
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        username,
        email,
        password: hashedPassword,
        idRol: idRol || null
      },
      include: {
        rol: true
      }
    });

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: nuevoUsuario.id, 
        email: nuevoUsuario.email,
        username: nuevoUsuario.username,
        rolId: nuevoUsuario.idRol
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: nuevoUsuario.id,
        username: nuevoUsuario.username,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol?.nombre || null
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario',
      details: error.message 
    });
  }
};

// Logout de usuario
export const logout = async (req, res) => {
  try {
    const ipOrigen = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Registrar en bitácora
    await BitacoraService.registrarLogout(req.user.id, req.user.username, ipOrigen);

    res.json({
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ 
      error: 'Error al cerrar sesión',
      details: error.message 
    });
  }
};
