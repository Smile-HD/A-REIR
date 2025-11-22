import prisma from '../config/database.js';

// Obtener todos los roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.rol.findMany({
      include: {
        permisos: {
          include: {
            permiso: true
          }
        },
        _count: {
          select: { usuarios: true }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    res.json({
      roles,
      total: roles.length
    });
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ 
      error: 'Error al obtener roles',
      details: error.message 
    });
  }
};

// Obtener rol por ID
export const getRolById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rol = await prisma.rol.findUnique({
      where: { id: parseInt(id) },
      include: {
        permisos: {
          include: {
            permiso: true
          }
        },
        usuarios: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    if (!rol) {
      return res.status(404).json({ 
        error: 'Rol no encontrado' 
      });
    }

    res.json(rol);
  } catch (error) {
    console.error('Error al obtener rol:', error);
    res.status(500).json({ 
      error: 'Error al obtener rol',
      details: error.message 
    });
  }
};

// Crear rol
export const createRol = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ 
        error: 'El nombre del rol es requerido' 
      });
    }

    const nuevoRol = await prisma.rol.create({
      data: { nombre }
    });

    res.status(201).json({
      message: 'Rol creado exitosamente',
      rol: nuevoRol
    });
  } catch (error) {
    console.error('Error al crear rol:', error);
    res.status(500).json({ 
      error: 'Error al crear rol',
      details: error.message 
    });
  }
};

// Actualizar rol
export const updateRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ 
        error: 'El nombre del rol es requerido' 
      });
    }

    const rolActualizado = await prisma.rol.update({
      where: { id: parseInt(id) },
      data: { nombre }
    });

    res.json({
      message: 'Rol actualizado exitosamente',
      rol: rolActualizado
    });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ 
      error: 'Error al actualizar rol',
      details: error.message 
    });
  }
};

// Eliminar rol
export const deleteRol = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.rol.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Rol eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({ 
      error: 'Error al eliminar rol',
      details: error.message 
    });
  }
};

// Asignar permisos a un rol
export const assignPermisosToRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { permisos } = req.body; // Array de IDs de permisos

    if (!Array.isArray(permisos)) {
      return res.status(400).json({ 
        error: 'Permisos debe ser un array de IDs' 
      });
    }

    // Eliminar permisos anteriores
    await prisma.rolPermiso.deleteMany({
      where: { idRol: parseInt(id) }
    });

    // Crear nuevas relaciones
    const nuevasRelaciones = permisos.map(idPermiso => ({
      idRol: parseInt(id),
      idPermiso: parseInt(idPermiso)
    }));

    await prisma.rolPermiso.createMany({
      data: nuevasRelaciones
    });

    const rolActualizado = await prisma.rol.findUnique({
      where: { id: parseInt(id) },
      include: {
        permisos: {
          include: {
            permiso: true
          }
        }
      }
    });

    res.json({
      message: 'Permisos asignados exitosamente',
      rol: rolActualizado
    });
  } catch (error) {
    console.error('Error al asignar permisos:', error);
    res.status(500).json({ 
      error: 'Error al asignar permisos',
      details: error.message 
    });
  }
};
