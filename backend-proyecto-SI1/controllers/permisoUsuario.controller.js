import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener permisos del usuario autenticado
export const getUserPermissions = async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.userId },
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
        empleado: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const permisos = usuario.rol.permisos.map(rp => rp.permiso.nombre);

    res.json({
      userId: usuario.id,
      username: usuario.username,
      email: usuario.email,
      rol: usuario.rol.nombre,
      empleadoCi: usuario.empleadoCi,
      empleado: usuario.empleado,
      permisos: permisos
    });
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    res.status(500).json({ 
      error: 'Error al obtener permisos del usuario',
      details: error.message 
    });
  }
};

// Verificar si el usuario tiene un permiso específico
export const checkUserPermission = async (req, res) => {
  try {
    const { permiso } = req.params;

    // Administrador tiene todos los permisos
    if (req.userRole === 'Administrador') {
      return res.json({ tiene_permiso: true });
    }

    const tienePermiso = req.userPermissions.includes(permiso);

    res.json({ tiene_permiso: tienePermiso });
  } catch (error) {
    console.error('Error al verificar permiso:', error);
    res.status(500).json({ 
      error: 'Error al verificar permiso',
      details: error.message 
    });
  }
};

export default {
  getUserPermissions,
  checkUserPermission
};
