import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';

// Obtener todos los usuarios
export const getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
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
      },
      orderBy: {
        id: 'asc'
      }
    });

    // Omitir passwords en la respuesta
    const usuariosSinPassword = usuarios.map(({ password, ...usuario }) => usuario);

    res.json({
      usuarios: usuariosSinPassword,
      total: usuarios.length
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      error: 'Error al obtener usuarios',
      details: error.message 
    });
  }
};

// Obtener usuario por ID
export const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
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
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    // Omitir password
    const { password, ...usuarioSinPassword } = usuario;

    res.json(usuarioSinPassword);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ 
      error: 'Error al obtener usuario',
      details: error.message 
    });
  }
};

// Crear usuario
export const createUsuario = async (req, res) => {
  try {
    const { username, email, password, idRol } = req.body;

    // Validar campos requeridos
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email y contraseña son requeridos' 
      });
    }

    // Verificar si ya existe
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

    // Omitir password
    const { password: _, ...usuarioSinPassword } = nuevoUsuario;

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: usuarioSinPassword
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ 
      error: 'Error al crear usuario',
      details: error.message 
    });
  }
};

// Actualizar usuario
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, idRol } = req.body;

    // Verificar si el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: parseInt(id) }
    });

    if (!usuarioExistente) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    // Preparar datos para actualizar
    const dataToUpdate = {};
    
    if (username) dataToUpdate.username = username;
    if (email) dataToUpdate.email = email;
    if (password) dataToUpdate.password = await bcrypt.hash(password, 10);
    if (idRol !== undefined) dataToUpdate.idRol = idRol;

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      include: {
        rol: true
      }
    });

    // Omitir password
    const { password: _, ...usuarioSinPassword } = usuarioActualizado;

    res.json({
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioSinPassword
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ 
      error: 'Error al actualizar usuario',
      details: error.message 
    });
  }
};

// Eliminar usuario
export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: parseInt(id) }
    });

    if (!usuarioExistente) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    await prisma.usuario.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ 
      error: 'Error al eliminar usuario',
      details: error.message 
    });
  }
};
