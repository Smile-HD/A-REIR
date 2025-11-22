import prisma from '../config/database.js';

// Obtener todos los empleados
export const getAllEmpleados = async (req, res) => {
  try {
    const empleados = await prisma.empleado.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            email: true,
            rol: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        ci: 'asc'
      }
    });

    res.json({
      empleados,
      total: empleados.length
    });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ 
      error: 'Error al obtener empleados',
      details: error.message 
    });
  }
};

// Obtener empleado por CI
export const getEmpleadoById = async (req, res) => {
  try {
    const { ci } = req.params;
    
    const empleado = await prisma.empleado.findUnique({
      where: { ci: parseInt(ci) },
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            email: true,
            rol: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      }
    });

    if (!empleado) {
      return res.status(404).json({ 
        error: 'Empleado no encontrado' 
      });
    }

    res.json(empleado);
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    res.status(500).json({ 
      error: 'Error al obtener empleado',
      details: error.message 
    });
  }
};

// Crear empleado
export const createEmpleado = async (req, res) => {
  try {
    const { ci, idUsuario, nombre, apellidos, direccion, telefono } = req.body;

    // Validaciones
    if (!ci || !nombre || !apellidos || !direccion || !telefono) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos excepto ID_USUARIO' 
      });
    }

    // Validar que el CI no exista
    const empleadoExistente = await prisma.empleado.findUnique({
      where: { ci: parseInt(ci) },
      include: {
        usuario: true
      }
    });

    if (empleadoExistente) {
      return res.status(400).json({ 
        error: 'Ya existe un empleado con ese CI' 
      });
    }

    // Si se proporciona un usuario, validar que exista y no esté asignado a otro empleado
    if (idUsuario) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(idUsuario) },
        include: { empleado: true }
      });

      if (!usuario) {
        return res.status(400).json({ 
          error: 'El usuario especificado no existe' 
        });
      }

      if (usuario.empleado) {
        return res.status(400).json({ 
          error: 'El usuario ya está asignado a otro empleado' 
        });
      }
    }

    const nuevoEmpleado = await prisma.empleado.create({
      data: {
        ci: parseInt(ci),
        nombre,
        apellidos,
        direccion,
        telefono
      },
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    // Si se proporcionó un usuario, actualizar la referencia
    if (idUsuario) {
      await prisma.usuario.update({
        where: { id: parseInt(idUsuario) },
        data: { empleadoCi: nuevoEmpleado.ci }
      });
    }

    res.status(201).json({
      message: 'Empleado creado exitosamente',
      empleado: nuevoEmpleado
    });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ 
      error: 'Error al crear empleado',
      details: error.message 
    });
  }
};

// Actualizar empleado
export const updateEmpleado = async (req, res) => {
  try {
    const { ci } = req.params;
    const { idUsuario, nombre, apellidos, direccion, telefono } = req.body;

    // Validar que el empleado exista
    const empleadoExistente = await prisma.empleado.findUnique({
      where: { ci: parseInt(ci) },
      include: {
        usuario: true
      }
    });

    if (!empleadoExistente) {
      return res.status(404).json({ 
        error: 'Empleado no encontrado' 
      });
    }

    // Si se proporciona un usuario diferente, validar
    if (idUsuario) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(idUsuario) },
        include: { empleado: true }
      });

      if (!usuario) {
        return res.status(400).json({ 
          error: 'El usuario especificado no existe' 
        });
      }

      if (usuario.empleado && usuario.empleado.ci !== parseInt(ci)) {
        return res.status(400).json({ 
          error: 'El usuario ya está asignado a otro empleado' 
        });
      }
    }

    // Primero actualizamos el empleado
    const empleadoActualizado = await prisma.empleado.update({
      where: { ci: parseInt(ci) },
      data: {
        nombre: nombre || empleadoExistente.nombre,
        apellidos: apellidos || empleadoExistente.apellidos,
        direccion: direccion || empleadoExistente.direccion,
        telefono: telefono || empleadoExistente.telefono
      },
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    // Si hay un usuario actual, desvincularlo
    if (empleadoExistente.usuario) {
      await prisma.usuario.update({
        where: { id: empleadoExistente.usuario.id },
        data: { empleadoCi: null }
      });
    }

    // Si se proporcionó un nuevo usuario, vincularlo
    if (idUsuario) {
      await prisma.usuario.update({
        where: { id: parseInt(idUsuario) },
        data: { empleadoCi: parseInt(ci) }
      });

      // Refrescar los datos del empleado para incluir el nuevo usuario
      const empleadoFinal = await prisma.empleado.findUnique({
        where: { ci: parseInt(ci) },
        include: {
          usuario: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      });

      res.json({
        message: 'Empleado actualizado exitosamente',
        empleado: empleadoFinal
      });
    } else {
      res.json({
        message: 'Empleado actualizado exitosamente',
        empleado: empleadoActualizado
      });
    }
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ 
      error: 'Error al actualizar empleado',
      details: error.message 
    });
  }
};

// Eliminar empleado
export const deleteEmpleado = async (req, res) => {
  try {
    const { ci } = req.params;

    await prisma.empleado.delete({
      where: { ci: parseInt(ci) }
    });

    res.json({
      message: 'Empleado eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ 
      error: 'Error al eliminar empleado',
      details: error.message 
    });
  }
};
