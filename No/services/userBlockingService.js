const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

class UserBlockingService {
  // Verificar si el usuario está bloqueado basándose en la bitácora
  static async verificarBloqueo(usuario_id) {
    const ahora = new Date();
    const hace12Horas = new Date(ahora.getTime() - (12 * 60 * 60 * 1000));

    // Contar intentos fallidos en las últimas 12 horas
    const intentosFallidos = await prisma.bitacora.count({
      where: {
        usuario_id: usuario_id,
        descripcion: {
          contains: 'Intento de login fallido - Contraseña incorrecta'
        },
        fecha_hora: {
          gte: hace12Horas
        }
      }
    });

    // Verificar si hay desbloqueo manual reciente
    const desbloqueoManual = await prisma.bitacora.findFirst({
      where: {
        usuario_id: usuario_id,
        descripcion: {
          contains: 'Usuario desbloqueado manualmente por administrador'
        },
        fecha_hora: {
          gte: hace12Horas
        }
      },
      orderBy: {
        fecha_hora: 'desc'
      }
    });

    // Si hay desbloqueo manual, verificar si hay intentos fallidos después
    if (desbloqueoManual) {
      const intentosDespuesDesbloqueo = await prisma.bitacora.count({
        where: {
          usuario_id: usuario_id,
          descripcion: {
            contains: 'Intento de login fallido - Contraseña incorrecta'
          },
          fecha_hora: {
            gt: desbloqueoManual.fecha_hora
          }
        }
      });
      
      return intentosDespuesDesbloqueo >= 5;
    }

    return intentosFallidos >= 5;
  }

  // Registrar intento fallido en la bitácora
  static async registrarIntentoFallido(usuario_id, nombreUsuario, ip_origen, razon = 'Contraseña incorrecta') {
    const ahora = new Date();
    const hace12Horas = new Date(ahora.getTime() - (12 * 60 * 60 * 1000));

    // Verificar si hay desbloqueo manual reciente
    const desbloqueoManual = await prisma.bitacora.findFirst({
      where: {
        usuario_id: usuario_id,
        descripcion: {
          contains: 'Usuario desbloqueado manualmente por administrador'
        },
        fecha_hora: {
          gte: hace12Horas
        }
      },
      orderBy: {
        fecha_hora: 'desc'
      }
    });

    let intentosFallidos;

    if (desbloqueoManual) {
      // Contar solo los intentos después del desbloqueo manual
      intentosFallidos = await prisma.bitacora.count({
        where: {
          usuario_id: usuario_id,
          descripcion: {
            contains: 'Intento de login fallido - Contraseña incorrecta'
          },
          fecha_hora: {
            gt: desbloqueoManual.fecha_hora
          }
        }
      });
    } else {
      // Contar intentos fallidos en las últimas 12 horas
      intentosFallidos = await prisma.bitacora.count({
        where: {
          usuario_id: usuario_id,
          descripcion: {
            contains: 'Intento de login fallido - Contraseña incorrecta'
          },
          fecha_hora: {
            gte: hace12Horas
          }
        }
      });
    }

    const nuevosIntentos = intentosFallidos + 1;

    // Registrar el nuevo intento fallido
    await prisma.bitacora.create({
      data: {
        usuario_id: usuario_id,
        descripcion: `Intento de login fallido - ${razon}: ${nombreUsuario} (Intento ${nuevosIntentos}/5)`,
        ip_origen: ip_origen
      }
    });

    // Si alcanza 5 intentos, registrar el bloqueo
    if (nuevosIntentos >= 5) {
      await prisma.bitacora.create({
        data: {
          usuario_id: usuario_id,
          descripcion: `Usuario bloqueado automáticamente por 5 intentos fallidos: ${nombreUsuario}`,
          ip_origen: ip_origen
        }
      });
    }

    return {
      bloqueado: nuevosIntentos >= 5,
      intentos: nuevosIntentos,
      intentosRestantes: Math.max(0, 5 - nuevosIntentos)
    };
  }

  // Registrar desbloqueo manual en la bitácora
  static async registrarDesbloqueoManual(usuario_id_admin, usuario_id_desbloqueado, nombreUsuario, ip_origen) {
    await prisma.bitacora.create({
      data: {
        usuario_id: usuario_id_admin,
        descripcion: `Desbloqueó manualmente al usuario: ${nombreUsuario} (ID: ${usuario_id_desbloqueado})`,
        ip_origen: ip_origen
      }
    });

    await prisma.bitacora.create({
      data: {
        usuario_id: usuario_id_desbloqueado,
        descripcion: `Usuario desbloqueado manualmente por administrador`,
        ip_origen: ip_origen
      }
    });
  }

  // Obtener información detallada del bloqueo
  static async obtenerInformacionBloqueo(usuario_id) {
    const ahora = new Date();
    const hace12Horas = new Date(ahora.getTime() - (12 * 60 * 60 * 1000));

    // Verificar desbloqueo manual reciente
    const desbloqueoManual = await prisma.bitacora.findFirst({
      where: {
        usuario_id: usuario_id,
        descripcion: {
          contains: 'Usuario desbloqueado manualmente por administrador'
        },
        fecha_hora: {
          gte: hace12Horas
        }
      },
      orderBy: {
        fecha_hora: 'desc'
      }
    });

    let intentosFallidos;
    let fechaInicioConteo = hace12Horas;

    if (desbloqueoManual) {
      // Contar solo los intentos después del desbloqueo manual
      fechaInicioConteo = desbloqueoManual.fecha_hora;
      intentosFallidos = await prisma.bitacora.findMany({
        where: {
          usuario_id: usuario_id,
          descripcion: {
            contains: 'Intento de login fallido - Contraseña incorrecta'
          },
          fecha_hora: {
            gt: desbloqueoManual.fecha_hora
          }
        },
        orderBy: {
          fecha_hora: 'desc'
        }
      });
    } else {
      // Obtener todos los intentos fallidos en las últimas 12 horas
      intentosFallidos = await prisma.bitacora.findMany({
        where: {
          usuario_id: usuario_id,
          descripcion: {
            contains: 'Intento de login fallido - Contraseña incorrecta'
          },
          fecha_hora: {
            gte: hace12Horas
          }
        },
        orderBy: {
          fecha_hora: 'desc'
        }
      });
    }

    const totalIntentos = intentosFallidos.length;
    const bloqueado = totalIntentos >= 5;

    let tiempoRestante = 0;
    let fechaBloqueo = null;
    let tiempoRestanteHoras = 0;
    let tiempoRestanteMinutos = 0;

    if (bloqueado && intentosFallidos.length > 0) {
      // El bloqueo inicia desde el quinto intento (cuando se alcanza el límite)
      // Buscar específicamente el registro de bloqueo automático
      const registroBloqueo = await prisma.bitacora.findFirst({
        where: {
          usuario_id: usuario_id,
          descripcion: {
            contains: 'Usuario bloqueado automáticamente'
          },
          fecha_hora: {
            gte: fechaInicioConteo
          }
        },
        orderBy: {
          fecha_hora: 'desc'
        }
      });

      if (registroBloqueo) {
        fechaBloqueo = new Date(registroBloqueo.fecha_hora);
      } else {
        // Fallback: usar el quinto intento fallido como fecha de bloqueo
        fechaBloqueo = new Date(intentosFallidos[Math.min(4, intentosFallidos.length - 1)].fecha_hora);
      }
      
      const tiempoTranscurrido = ahora - fechaBloqueo;
      const doceHoras = 12 * 60 * 60 * 1000;
      tiempoRestante = Math.max(0, doceHoras - tiempoTranscurrido);
      
      // Calcular horas y minutos
      tiempoRestanteHoras = Math.floor(tiempoRestante / (1000 * 60 * 60));
      tiempoRestanteMinutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
    }

    return {
      bloqueado,
      intentos: totalIntentos,
      tiempoRestante,
      tiempoRestanteHoras,
      tiempoRestanteMinutos,
      fechaBloqueo,
      ultimoIntento: intentosFallidos.length > 0 ? intentosFallidos[0].fecha_hora : null,
      desbloqueadoManualmente: !!desbloqueoManual
    };
  }

  // Limpiar bloqueo (registrar login exitoso)
  static async registrarLoginExitoso(usuario_id, nombreUsuario, ip_origen) {
    await prisma.bitacora.create({
      data: {
        usuario_id: usuario_id,
        descripcion: `Login exitoso: ${nombreUsuario}`,
        ip_origen: ip_origen
      }
    });
  }

  // Obtener usuarios bloqueados (para administradores)
  static async obtenerUsuariosBloqueados() {
    const ahora = new Date();
    const hace12Horas = new Date(ahora.getTime() - (12 * 60 * 60 * 1000));

    // Buscar usuarios con 5 o más intentos fallidos en las últimas 12 horas
    const usuariosBloqueados = await prisma.bitacora.groupBy({
      by: ['usuario_id'],
      where: {
        descripcion: {
          contains: 'Intento de login fallido - Contraseña incorrecta'
        },
        fecha_hora: {
          gte: hace12Horas
        },
        usuario_id: {
          not: null
        }
      },
      _count: {
        id_bitacora: true
      },
      having: {
        id_bitacora: {
          _count: {
            gte: 5
          }
        }
      }
    });

    // Obtener información completa de cada usuario bloqueado
    const usuariosConDetalles = await Promise.all(
      usuariosBloqueados.map(async (grupo) => {
        const usuario = await prisma.usuario.findUnique({
          where: { id: grupo.usuario_id },
          include: {
            empleado: true
          }
        });

        if (!usuario) return null;

        const infoBloqueo = await this.obtenerInformacionBloqueo(grupo.usuario_id);
        
        return {
          id: usuario.id,
          usuario: usuario.usuario,
          empleado: usuario.empleado.nombre,
          email: usuario.email,
          ...infoBloqueo
        };
      })
    );

    return usuariosConDetalles.filter(u => u !== null && u.bloqueado);
  }

  // Obtener historial de bloqueos para un usuario específico
  static async obtenerHistorialBloqueos(usuario_id, dias = 30) {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    return await prisma.bitacora.findMany({
      where: {
        usuario_id: usuario_id,
        OR: [
          { descripcion: { contains: 'Intento de login fallido - Contraseña incorrecta' } },
          { descripcion: { contains: 'Usuario bloqueado automáticamente' } },
          { descripcion: { contains: 'Usuario desbloqueado manualmente' } },
          { descripcion: { contains: 'Login exitoso' } }
        ],
        fecha_hora: {
          gte: fechaLimite
        }
      },
      orderBy: {
        fecha_hora: 'desc'
      }
    });
  }
}

module.exports = UserBlockingService;
