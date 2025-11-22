import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware básico de autenticación (ya existe)
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-muy-segura-2024');
    
    // Obtener usuario completo con rol y permisos
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      include: {
        rol: {
          include: {
            permisos: {
              include: {
                permiso: true
              }
            }
          }
        },
        empleado: true  // Incluir datos del empleado si está vinculado
      }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Guardar usuario en request para usar en los controladores
    req.user = usuario;
    req.userId = usuario.id;
    req.userRole = usuario.rol.nombre;
    req.empleadoCi = usuario.empleadoCi; // CI del empleado vinculado (puede ser null)
    
    // Extraer permisos del usuario
    req.userPermissions = usuario.rol.permisos.map(rp => rp.permiso.nombre);

    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar permisos específicos
export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Administrador tiene todos los permisos
    if (req.userRole === 'Administrador') {
      return next();
    }

    // Verificar si el usuario tiene el permiso específico
    if (!req.userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ 
        error: 'No tienes permiso para realizar esta acción',
        requiredPermission 
      });
    }

    next();
  };
};

// Middleware para verificar múltiples permisos (OR)
export const checkAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Administrador tiene todos los permisos
    if (req.userRole === 'Administrador') {
      return next();
    }

    // Verificar si el usuario tiene al menos uno de los permisos
    const hasPermission = permissions.some(perm => req.userPermissions.includes(perm));
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'No tienes permiso para realizar esta acción',
        requiredPermissions: permissions 
      });
    }

    next();
  };
};

// Middleware para verificar si es el propietario del recurso o tiene permiso
export const checkOwnershipOrPermission = (getResourceOwnerId, requiredPermission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Administrador puede todo
    if (req.userRole === 'Administrador') {
      return next();
    }

    // Verificar si tiene el permiso general
    if (req.userPermissions.includes(requiredPermission)) {
      return next();
    }

    // Verificar si es el propietario del recurso
    const ownerId = await getResourceOwnerId(req);
    
    if (req.empleadoCi && req.empleadoCi === ownerId) {
      return next();
    }

    return res.status(403).json({ 
      error: 'No tienes permiso para acceder a este recurso' 
    });
  };
};

// Helper para verificar si un usuario puede ver solo sus propios datos
export const canViewOnlyOwn = (userRole) => {
  return userRole === 'Empleado';
};

// Helper para verificar si un usuario puede editar solo sus propios datos
export const canEditOnlyOwn = (userRole) => {
  return userRole === 'Empleado';
};

export default {
  authenticate,
  checkPermission,
  checkAnyPermission,
  checkOwnershipOrPermission,
  canViewOnlyOwn,
  canEditOnlyOwn
};
