const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const Validaciones = require("../../utils/validaciones");
const jwt = require("jsonwebtoken");
const { bitacora, getClientIp } = require("../../utils/bitacora");
const UserBlockingService = require("../../services/userBlockingService");

// Login usuario

const login = async (req, res) => {
  const { usuario: nombreUsuario, contrasena } = req.body;

  try {
    // Validaciones básicas
    Validaciones.usuario(nombreUsuario);
    Validaciones.contrasena(contrasena);

    // Buscar el usuario
    const user = await prisma.usuario.findUnique({
      where: { usuario: nombreUsuario },
      include: {
        administrador: true,
        empleado: true
      }
    });

    if (!user) {
      // Registrar intento con usuario inexistente
      await prisma.bitacora.create({
        data: {
          usuario_id: null,
          descripcion: `Intento de login con usuario inexistente: ${nombreUsuario}`,
          ip_origen: getClientIp(req)
        }
      });
      
      return res.status(401).json({ 
        error: "Credenciales incorrectas",
        message: "Usuario o contraseña incorrectos"
      });
    }

    // Verificar si el usuario está bloqueado
    const estaBloqueado = await UserBlockingService.verificarBloqueo(user.id);
    
    if (estaBloqueado) {
      const infoBloqueo = await UserBlockingService.obtenerInformacionBloqueo(user.id);
      
      // Registrar intento de login en usuario bloqueado
      await prisma.bitacora.create({
        data: {
          usuario_id: user.id,
          descripcion: `Intento de login en usuario bloqueado: ${nombreUsuario}`,
          ip_origen: getClientIp(req)
        }
      });

      return res.status(423).json({ 
        error: "Usuario bloqueado",
        message: `Tu cuenta está bloqueada por múltiples intentos fallidos. Intenta nuevamente en ${infoBloqueo.tiempoRestanteHoras}h ${infoBloqueo.tiempoRestanteMinutos}m.`,
        bloqueado: true,
        tiempoRestante: infoBloqueo.tiempoRestante,
        tiempoRestanteHoras: infoBloqueo.tiempoRestanteHoras,
        tiempoRestanteMinutos: infoBloqueo.tiempoRestanteMinutos,
        intentos: infoBloqueo.intentos
      });
    }

    // Verificar la contraseña
    const isValid = await bcrypt.compare(contrasena, user.contrasena);

    if (!isValid) {
      // Registrar intento fallido y obtener información de bloqueo
      const resultado = await UserBlockingService.registrarIntentoFallido(
        user.id, 
        nombreUsuario, 
        getClientIp(req)
      );

      if (resultado.bloqueado) {
        return res.status(423).json({ 
          error: "Usuario bloqueado",
          message: 'Tu cuenta ha sido bloqueada por múltiples intentos fallidos. Intenta nuevamente en 12 horas o contacta al administrador.',
          bloqueado: true,
          intentos: resultado.intentos
        });
      }

      return res.status(401).json({ 
        error: "Credenciales incorrectas",
        message: "Usuario o contraseña incorrectos",
        intentosRestantes: resultado.intentosRestantes,
        warning: resultado.intentosRestantes <= 2 ? `Solo te quedan ${resultado.intentosRestantes} intentos antes del bloqueo` : null
      });
    }

    // Login exitoso: registrar en bitácora
    await UserBlockingService.registrarLoginExitoso(user.id, nombreUsuario, getClientIp(req));

    const isAdmin = !!user.administrador;
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id,
        usuario: user.usuario, 
        email: user.email,
        isAdmin: isAdmin,
        empleado_ci: user.empleado_ci
      },
      process.env.SECRET_KEY,
      { expiresIn: "8h" }
    );

    const { contrasena: _, ...userWithoutPassword } = user;

    // Configurar cookie
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Siempre true para HTTPS en producción
      sameSite: "None", // Cambiado a None para permitir cross-origin
      maxAge: 8 * 60 * 60 * 1000, // 8 horas
      path: '/'
    };
    
    // Debug log
    console.log('🍪 Configurando cookie con opciones:', cookieOptions);
    console.log('🌐 Request Origin:', req.headers.origin);
    
    res.cookie("access_token", token, cookieOptions);

    return res.status(200).json({
      message: "Login exitoso",
      usuario: userWithoutPassword.usuario,
      email: userWithoutPassword.email,
      isAdmin: isAdmin,
      empleado: userWithoutPassword.empleado,
      token: token,
    });

  } catch (error) {
    console.error("Error al iniciar sesión", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      message: "Un error ocurrió mientras procesábamos tu solicitud.",
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: true, // Siempre true para HTTPS
      sameSite: "None", // Igual configuración que al crear la cookie
      path: '/'
    });
    await bitacora({
      req,
      res,
      descripcion: `Cierre de sesión exitoso para el usuario ${req.user.usuario}`,
    });
    return res.status(200).json({ message: "Logout exitoso" });
  } catch (error) {
    console.error("Error al cerrar sesión", error);
    return res.status(400).json({
      error: error.message || "Un error ocurrió mientras cerrabas sesión.",
    });
  }
};

// Verificar sesión activa
const verificarSesion = async (req, res) => {
  try {
    // Si llegamos aquí, el middleware de autenticación ya validó el token
    // Los datos ya están en req.user del JWT
    return res.status(200).json({
      usuario: req.user.usuario,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
      empleado_ci: req.user.empleado_ci,
      isAuthenticated: true
    });
  } catch (error) {
    console.error("Error al verificar sesión", error);
    return res.status(401).json({ error: "Sesión inválida" });
  }
};

// Desbloquear usuario manualmente (solo administradores)
const desbloquearUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    // Verificar que el usuario que hace la petición es admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({ 
        error: "Acceso denegado",
        message: "Solo administradores pueden desbloquear usuarios." 
      });
    }

    // Verificar que el usuario a desbloquear existe
    const usuarioADesbloquear = await prisma.usuario.findUnique({
      where: { id: parseInt(usuario_id) },
      include: { empleado: true }
    });

    if (!usuarioADesbloquear) {
      return res.status(404).json({ 
        error: "Usuario no encontrado",
        message: "El usuario especificado no existe" 
      });
    }

    // Verificar si el usuario realmente está bloqueado
    const estaBloqueado = await UserBlockingService.verificarBloqueo(parseInt(usuario_id));
    
    if (!estaBloqueado) {
      return res.status(400).json({
        error: "Usuario no bloqueado",
        message: "Este usuario no está actualmente bloqueado"
      });
    }

    // Registrar el desbloqueo manual
    await UserBlockingService.registrarDesbloqueoManual(
      req.user.id,
      parseInt(usuario_id),
      usuarioADesbloquear.usuario,
      getClientIp(req)
    );

    res.json({ 
      message: `Usuario ${usuarioADesbloquear.usuario} desbloqueado exitosamente`,
      usuario: usuarioADesbloquear.usuario,
      empleado: usuarioADesbloquear.empleado.nombre
    });

  } catch (error) {
    console.error('Error al desbloquear usuario:', error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error.message
    });
  }
};

// Obtener estado de bloqueo de un usuario específico
const estadoBloqueoUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    // Solo admins o el mismo usuario pueden ver su estado
    if (!req.user?.isAdmin && req.user?.id !== parseInt(usuario_id)) {
      return res.status(403).json({ 
        error: "Acceso denegado",
        message: "Solo puedes ver tu propio estado de bloqueo o ser administrador" 
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(usuario_id) },
      include: { empleado: true }
    });

    if (!usuario) {
      return res.status(404).json({ 
        error: "Usuario no encontrado",
        message: "El usuario especificado no existe" 
      });
    }

    const infoBloqueo = await UserBlockingService.obtenerInformacionBloqueo(parseInt(usuario_id));

    res.json({
      usuario: usuario.usuario,
      empleado: usuario.empleado.nombre,
      bloqueado: infoBloqueo.bloqueado,
      intentos_fallidos: infoBloqueo.intentos,
      tiempo_restante_ms: infoBloqueo.tiempoRestante,
      tiempo_restante_horas: infoBloqueo.tiempoRestanteHoras,
      tiempo_restante_minutos: infoBloqueo.tiempoRestanteMinutos,
      fecha_bloqueo: infoBloqueo.fechaBloqueo,
      ultimo_intento: infoBloqueo.ultimoIntento,
      desbloqueado_manualmente: infoBloqueo.desbloqueadoManualmente
    });

  } catch (error) {
    console.error('Error al obtener estado de bloqueo:', error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error.message
    });
  }
};

// Obtener lista de usuarios bloqueados (solo administradores)
const usuariosBloqueados = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ 
        error: "Acceso denegado",
        message: "Solo administradores pueden ver la lista de usuarios bloqueados." 
      });
    }

    const usuarios = await UserBlockingService.obtenerUsuariosBloqueados();

    res.json({
      message: `Se encontraron ${usuarios.length} usuarios bloqueados`,
      usuarios: usuarios.map(u => ({
        id: u.id,
        usuario: u.usuario,
        empleado: u.empleado,
        email: u.email,
        intentos: u.intentos,
        tiempo_restante_horas: Math.ceil(u.tiempoRestante / (1000 * 60 * 60)),
        tiempo_restante_minutos: Math.ceil((u.tiempoRestante % (1000 * 60 * 60)) / (1000 * 60)),
        fecha_bloqueo: u.fechaBloqueo,
        desbloqueado_manualmente: u.desbloqueadoManualmente
      }))
    });

  } catch (error) {
    console.error('Error al obtener usuarios bloqueados:', error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error.message
    });
  }
};

// Obtener historial de bloqueos de un usuario (solo administradores)
const historialBloqueos = async (req, res) => {
  const { usuario_id } = req.params;
  const { dias = 30 } = req.query;

  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ 
        error: "Acceso denegado",
        message: "Solo administradores pueden ver el historial de bloqueos." 
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(usuario_id) },
      include: { empleado: true }
    });

    if (!usuario) {
      return res.status(404).json({ 
        error: "Usuario no encontrado",
        message: "El usuario especificado no existe" 
      });
    }

    const historial = await UserBlockingService.obtenerHistorialBloqueos(
      parseInt(usuario_id),
      parseInt(dias)
    );

    res.json({
      usuario: usuario.usuario,
      empleado: usuario.empleado.nombre,
      dias_consultados: parseInt(dias),
      total_eventos: historial.length,
      historial: historial.map(evento => ({
        descripcion: evento.descripcion,
        fecha_hora: evento.fecha_hora,
        ip_origen: evento.ip_origen
      }))
    });

  } catch (error) {
    console.error('Error al obtener historial de bloqueos:', error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error.message
    });
  }
};

module.exports = { 
  login, 
  logout, 
  verificarSesion, 
  desbloquearUsuario, 
  estadoBloqueoUsuario, 
  usuariosBloqueados, 
  historialBloqueos 
};
