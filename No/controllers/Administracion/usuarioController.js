const { PrismaClient } = require('../../generated/prisma');
const bcrypt = require('bcrypt');
const { registrarBitacora } = require('../../utils/bitacora');
const { validarDatos } = require('../../utils/validaciones');

const prisma = new PrismaClient();

// Crear usuario
const createUsuario = async (req, res) => {
  try {
    const { empleado_ci, usuario, contrasena, email } = req.body;

    // Validar datos obligatorios
    if (!empleado_ci || !usuario || !contrasena) {
      return res.status(400).json({
        error: 'Los campos empleado_ci, usuario y contraseña son obligatorios'
      });
    }

    // Validar formato de datos
    const validacionEmpleado = validarDatos.cedula(empleado_ci);
    if (!validacionEmpleado.valido) {
      return res.status(400).json({ error: validacionEmpleado.mensaje });
    }

    const validacionUsuario = validarDatos.texto(usuario, 3, 50);
    if (!validacionUsuario.valido) {
      return res.status(400).json({ 
        error: `Usuario inválido: ${validacionUsuario.mensaje}` 
      });
    }

    const validacionContrasena = validarDatos.texto(contrasena, 6, 200);
    if (!validacionContrasena.valido) {
      return res.status(400).json({ 
        error: `Contraseña inválida: ${validacionContrasena.mensaje}` 
      });
    }

    if (email) {
      const validacionEmail = validarDatos.email(email);
      if (!validacionEmail.valido) {
        return res.status(400).json({ error: validacionEmail.mensaje });
      }
    }

    // Verificar que el empleado existe
    const empleadoExiste = await prisma.empleado.findUnique({
      where: { ci: parseInt(empleado_ci) }
    });

    if (!empleadoExiste) {
      return res.status(404).json({
        error: 'El empleado especificado no existe'
      });
    }

    // Verificar que el empleado no tenga ya un usuario
    const usuarioExistenteEmpleado = await prisma.usuario.findUnique({
      where: { empleado_ci: parseInt(empleado_ci) }
    });

    if (usuarioExistenteEmpleado) {
      return res.status(400).json({
        error: 'Este empleado ya tiene un usuario asignado'
      });
    }

    // Verificar que el nombre de usuario no esté en uso
    const usuarioExistenteNombre = await prisma.usuario.findUnique({
      where: { usuario: usuario }
    });

    if (usuarioExistenteNombre) {
      return res.status(400).json({
        error: 'Este nombre de usuario ya está en uso'
      });
    }

    // Verificar que el email no esté en uso (si se proporciona)
    if (email) {
      const emailExistente = await prisma.usuario.findUnique({
        where: { email: email }
      });

      if (emailExistente) {
        return res.status(400).json({
          error: 'Este email ya está en uso'
        });
      }
    }

    // Encriptar contraseña
    const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);

    // Crear usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        empleado_ci: parseInt(empleado_ci),
        usuario,
        contrasena: contrasenaEncriptada,
        email: email || null
      },
      include: {
        empleado: true
      }
    });

    // Registrar en bitácora
    await registrarBitacora(
      req.usuario?.id,
      `Usuario creado: ${usuario} para empleado ${empleadoExiste.nombre}`,
      req.ip
    );

    // No devolver la contraseña en la respuesta
    const { contrasena: _, ...usuarioSinContrasena } = nuevoUsuario;

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: usuarioSinContrasena
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor al crear usuario'
    });
  }
};

// Obtener todos los usuarios con paginación
const getAllUsuarios = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'usuario';
    const sortOrder = req.query.sortOrder || 'asc';
    const skip = (page - 1) * limit;

    // Validar parámetros de ordenamiento
    const validSortFields = ['id', 'usuario', 'email', 'empleado_ci'];
    const validSortOrders = ['asc', 'desc'];

    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({
        error: 'Campo de ordenamiento inválido'
      });
    }

    if (!validSortOrders.includes(sortOrder)) {
      return res.status(400).json({
        error: 'Orden de ordenamiento inválido'
      });
    }

    const orderBy = {};
    if (sortBy === 'empleado_ci') {
      orderBy.empleado = { nombre: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Contar total de usuarios
    const totalUsuarios = await prisma.usuario.count();

    // Obtener usuarios
    const usuarios = await prisma.usuario.findMany({
      skip,
      take: limit,
      orderBy,
      include: {
        empleado: true,
        administrador: true,
        _count: {
          select: {
            bitacora: true
          }
        }
      }
    });

    // Remover contraseñas de la respuesta
    const usuariosSinContrasenas = usuarios.map(usuario => {
      const { contrasena, ...usuarioSinContrasena } = usuario;
      return usuarioSinContrasena;
    });

    const totalPages = Math.ceil(totalUsuarios / limit);

    res.json({
      usuarios: usuariosSinContrasenas,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsuarios,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener usuarios'
    });
  }
};

// Obtener usuario por ID
const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      include: {
        empleado: true,
        administrador: true,
        _count: {
          select: {
            bitacora: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Remover contraseña de la respuesta
    const { contrasena, ...usuarioSinContrasena } = usuario;

    res.json(usuarioSinContrasena);

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener usuario'
    });
  }
};

// Actualizar usuario
const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario, email, contrasena } = req.body;

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      include: { empleado: true }
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const datosActualizar = {};

    // Validar y preparar usuario si se proporciona
    if (usuario !== undefined) {
      if (!usuario.trim()) {
        return res.status(400).json({
          error: 'El nombre de usuario no puede estar vacío'
        });
      }

      const validacionUsuario = validarDatos.texto(usuario, 3, 50);
      if (!validacionUsuario.valido) {
        return res.status(400).json({ 
          error: `Usuario inválido: ${validacionUsuario.mensaje}` 
        });
      }

      // Verificar que el nombre de usuario no esté en uso por otro usuario
      const usuarioConMismoNombre = await prisma.usuario.findUnique({
        where: { usuario: usuario }
      });

      if (usuarioConMismoNombre && usuarioConMismoNombre.id !== parseInt(id)) {
        return res.status(400).json({
          error: 'Este nombre de usuario ya está en uso'
        });
      }

      datosActualizar.usuario = usuario;
    }

    // Validar y preparar email si se proporciona
    if (email !== undefined) {
      if (email && email.trim()) {
        const validacionEmail = validarDatos.email(email);
        if (!validacionEmail.valido) {
          return res.status(400).json({ error: validacionEmail.mensaje });
        }

        // Verificar que el email no esté en uso por otro usuario
        const usuarioConMismoEmail = await prisma.usuario.findUnique({
          where: { email: email }
        });

        if (usuarioConMismoEmail && usuarioConMismoEmail.id !== parseInt(id)) {
          return res.status(400).json({
            error: 'Este email ya está en uso'
          });
        }

        datosActualizar.email = email;
      } else {
        datosActualizar.email = null;
      }
    }

    // Validar y preparar contraseña si se proporciona
    if (contrasena !== undefined) {
      if (!contrasena.trim()) {
        return res.status(400).json({
          error: 'La contraseña no puede estar vacía'
        });
      }

      const validacionContrasena = validarDatos.texto(contrasena, 6, 200);
      if (!validacionContrasena.valido) {
        return res.status(400).json({ 
          error: `Contraseña inválida: ${validacionContrasena.mensaje}` 
        });
      }

      // Encriptar nueva contraseña
      datosActualizar.contrasena = await bcrypt.hash(contrasena, 10);
    }

    // Actualizar usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: datosActualizar,
      include: {
        empleado: true,
        administrador: true
      }
    });

    // Registrar en bitácora
    await registrarBitacora(
      req.usuario?.id,
      `Usuario actualizado: ${usuarioActualizado.usuario} (${usuarioExistente.empleado.nombre})`,
      req.ip
    );

    // Remover contraseña de la respuesta
    const { contrasena: _, ...usuarioSinContrasena } = usuarioActualizado;

    res.json({
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioSinContrasena
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor al actualizar usuario'
    });
  }
};

// Eliminar usuario
const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      include: { 
        empleado: true,
        administrador: true,
        _count: {
          select: {
            bitacora: true
          }
        }
      }
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Verificar si es administrador
    if (usuarioExistente.administrador) {
      return res.status(400).json({
        error: 'No se puede eliminar un usuario que es administrador'
      });
    }

    // Verificar si tiene registros de bitácora
    if (usuarioExistente._count.bitacora > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar un usuario que tiene registros de actividad en el sistema'
      });
    }

    // Eliminar usuario
    await prisma.usuario.delete({
      where: { id: parseInt(id) }
    });

    // Registrar en bitácora
    await registrarBitacora(
      req.usuario?.id,
      `Usuario eliminado: ${usuarioExistente.usuario} (${usuarioExistente.empleado.nombre})`,
      req.ip
    );

    res.json({
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor al eliminar usuario'
    });
  }
};

// Buscar usuarios con paginación
const searchUsuarios = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'usuario';
    const sortOrder = req.query.sortOrder || 'asc';
    const skip = (page - 1) * limit;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        error: 'El parámetro de búsqueda es requerido'
      });
    }

    const searchTerm = q.trim();

    // Construir condiciones de búsqueda
    const searchConditions = {
      OR: [
        {
          usuario: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          empleado: {
            nombre: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        },
        {
          empleado: {
            ci: !isNaN(parseInt(searchTerm)) ? parseInt(searchTerm) : undefined
          }
        }
      ].filter(condition => {
        // Filtrar condiciones undefined
        if (condition.empleado?.ci === undefined) {
          delete condition.empleado;
          return Object.keys(condition).length > 0;
        }
        return true;
      })
    };

    // Validar parámetros de ordenamiento
    const validSortFields = ['id', 'usuario', 'email', 'empleado_ci'];
    const validSortOrders = ['asc', 'desc'];

    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({
        error: 'Campo de ordenamiento inválido'
      });
    }

    if (!validSortOrders.includes(sortOrder)) {
      return res.status(400).json({
        error: 'Orden de ordenamiento inválido'
      });
    }

    const orderBy = {};
    if (sortBy === 'empleado_ci') {
      orderBy.empleado = { nombre: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Contar resultados de búsqueda
    const totalResults = await prisma.usuario.count({
      where: searchConditions
    });

    // Realizar búsqueda
    const usuarios = await prisma.usuario.findMany({
      where: searchConditions,
      skip,
      take: limit,
      orderBy,
      include: {
        empleado: true,
        administrador: true,
        _count: {
          select: {
            bitacora: true
          }
        }
      }
    });

    // Remover contraseñas de la respuesta
    const usuariosSinContrasenas = usuarios.map(usuario => {
      const { contrasena, ...usuarioSinContrasena } = usuario;
      return usuarioSinContrasena;
    });

    const totalPages = Math.ceil(totalResults / limit);

    res.json({
      usuarios: usuariosSinContrasenas,
      pagination: {
        currentPage: page,
        totalPages,
        totalResults,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        searchTerm
      }
    });

  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({
      error: 'Error interno del servidor al buscar usuarios'
    });
  }
};

// Cambiar contraseña
const cambiarContrasena = async (req, res) => {
  try {
    const { id } = req.params;
    const { contrasenaActual, contrasenaNueva } = req.body;

    if (!contrasenaActual || !contrasenaNueva) {
      return res.status(400).json({
        error: 'Se requieren la contraseña actual y la nueva contraseña'
      });
    }

    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      include: { empleado: true }
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Verificar la contraseña actual
    const contrasenaValida = await bcrypt.compare(contrasenaActual, usuario.contrasena);
    if (!contrasenaValida) {
      return res.status(400).json({
        error: 'La contraseña actual es incorrecta'
      });
    }

    // Validar nueva contraseña
    const validacionContrasena = validarDatos.texto(contrasenaNueva, 6, 200);
    if (!validacionContrasena.valido) {
      return res.status(400).json({ 
        error: `Nueva contraseña inválida: ${validacionContrasena.mensaje}` 
      });
    }

    // Encriptar nueva contraseña
    const contrasenaEncriptada = await bcrypt.hash(contrasenaNueva, 10);

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { contrasena: contrasenaEncriptada }
    });

    // Registrar en bitácora
    await registrarBitacora(
      req.usuario?.id,
      `Contraseña cambiada para usuario: ${usuario.usuario} (${usuario.empleado.nombre})`,
      req.ip
    );

    res.json({
      message: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      error: 'Error interno del servidor al cambiar contraseña'
    });
  }
};

// Promover usuario a administrador
const promoverAdministrador = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      include: { 
        empleado: true,
        administrador: true
      }
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Verificar si ya es administrador
    if (usuarioExistente.administrador) {
      return res.status(400).json({
        error: 'Este usuario ya es administrador'
      });
    }

    // Crear registro de administrador
    await prisma.administrador.create({
      data: {
        usuario_id: parseInt(id)
      }
    });

    // Registrar en bitácora
    await registrarBitacora(
      req.usuario?.id,
      `Usuario promovido a administrador: ${usuarioExistente.usuario} (${usuarioExistente.empleado.nombre})`,
      req.ip
    );

    res.json({
      message: 'Usuario promovido a administrador exitosamente'
    });

  } catch (error) {
    console.error('Error al promover usuario a administrador:', error);
    res.status(500).json({
      error: 'Error interno del servidor al promover usuario'
    });
  }
};

// Degradar administrador a usuario normal
const degradarAdministrador = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      include: { 
        empleado: true,
        administrador: true
      }
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Verificar si no es administrador
    if (!usuarioExistente.administrador) {
      return res.status(400).json({
        error: 'Este usuario no es administrador'
      });
    }

    // Verificar que no se esté degradando a sí mismo
    if (parseInt(id) === req.usuario?.id) {
      return res.status(400).json({
        error: 'No puedes removerte los privilegios de administrador a ti mismo'
      });
    }

    // Verificar que quede al menos un administrador en el sistema
    const totalAdministradores = await prisma.administrador.count();
    if (totalAdministradores <= 1) {
      return res.status(400).json({
        error: 'No se puede degradar al último administrador del sistema'
      });
    }

    // Eliminar registro de administrador
    await prisma.administrador.delete({
      where: { usuario_id: parseInt(id) }
    });

    // Registrar en bitácora
    await registrarBitacora(
      req.usuario?.id,
      `Administrador degradado a usuario normal: ${usuarioExistente.usuario} (${usuarioExistente.empleado.nombre})`,
      req.ip
    );

    res.json({
      message: 'Administrador degradado a usuario normal exitosamente'
    });

  } catch (error) {
    console.error('Error al degradar administrador:', error);
    res.status(500).json({
      error: 'Error interno del servidor al degradar administrador'
    });
  }
};

module.exports = {
  createUsuario,
  getAllUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
  searchUsuarios,
  cambiarContrasena,
  promoverAdministrador,
  degradarAdministrador
};