import prisma from '../config/database.js';

// Obtener todos los permisos
export const getAllPermisos = async (req, res) => {
  try {
    const permisos = await prisma.permiso.findMany({
      include: {
        _count: {
          select: { roles: true }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    res.json({
      permisos,
      total: permisos.length
    });
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    res.status(500).json({ 
      error: 'Error al obtener permisos',
      details: error.message 
    });
  }
};

// Obtener permiso por ID
export const getPermisoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const permiso = await prisma.permiso.findUnique({
      where: { id: parseInt(id) },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    if (!permiso) {
      return res.status(404).json({ 
        error: 'Permiso no encontrado' 
      });
    }

    res.json(permiso);
  } catch (error) {
    console.error('Error al obtener permiso:', error);
    res.status(500).json({ 
      error: 'Error al obtener permiso',
      details: error.message 
    });
  }
};

// Crear permiso
export const createPermiso = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ 
        error: 'El nombre del permiso es requerido' 
      });
    }

    const nuevoPermiso = await prisma.permiso.create({
      data: { nombre }
    });

    res.status(201).json({
      message: 'Permiso creado exitosamente',
      permiso: nuevoPermiso
    });
  } catch (error) {
    console.error('Error al crear permiso:', error);
    res.status(500).json({ 
      error: 'Error al crear permiso',
      details: error.message 
    });
  }
};

// Actualizar permiso
export const updatePermiso = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ 
        error: 'El nombre del permiso es requerido' 
      });
    }

    const permisoActualizado = await prisma.permiso.update({
      where: { id: parseInt(id) },
      data: { nombre }
    });

    res.json({
      message: 'Permiso actualizado exitosamente',
      permiso: permisoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar permiso:', error);
    res.status(500).json({ 
      error: 'Error al actualizar permiso',
      details: error.message 
    });
  }
};

// Eliminar permiso
export const deletePermiso = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.permiso.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Permiso eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar permiso:', error);
    res.status(500).json({ 
      error: 'Error al eliminar permiso',
      details: error.message 
    });
  }
};
