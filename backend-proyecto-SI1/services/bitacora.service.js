import prisma from '../config/database.js';

/**
 * Servicio para registrar acciones en la bitácora
 */
class BitacoraService {
  /**
   * Registra una acción en la bitácora
   * @param {Object} datos - Datos de la acción
   * @param {number} datos.usuarioId - ID del usuario que realizó la acción
   * @param {string} datos.descripcion - Descripción de la acción
   * @param {string} [datos.ipOrigen] - IP del usuario (opcional)
   */
  static async registrar({ usuarioId, descripcion, ipOrigen = null }) {
    try {
      await prisma.bitacora.create({
        data: {
          usuarioId,
          descripcion,
          ipOrigen
        }
      });
    } catch (error) {
      console.error('Error al registrar en bitácora:', error);
      // No lanzamos error para no afectar la operación principal
    }
  }

  /**
   * Registra un inicio de sesión
   */
  static async registrarLogin(usuarioId, username, ipOrigen) {
    await this.registrar({
      usuarioId,
      descripcion: `Inicio de sesión: ${username}`,
      ipOrigen
    });
  }

  /**
   * Registra un cierre de sesión
   */
  static async registrarLogout(usuarioId, username, ipOrigen) {
    await this.registrar({
      usuarioId,
      descripcion: `Cierre de sesión: ${username}`,
      ipOrigen
    });
  }

  /**
   * Registra la creación de un registro
   */
  static async registrarCreacion(usuarioId, modulo, datos, ipOrigen) {
    const descripcion = `Creó ${modulo}: ${JSON.stringify(datos)}`;
    await this.registrar({ usuarioId, descripcion, ipOrigen });
  }

  /**
   * Registra la actualización de un registro
   */
  static async registrarActualizacion(usuarioId, modulo, id, datosAnteriores, datosNuevos, ipOrigen) {
    const cambios = this.detectarCambios(datosAnteriores, datosNuevos);
    const descripcion = `Actualizó ${modulo} [ID: ${id}]: ${cambios}`;
    await this.registrar({ usuarioId, descripcion, ipOrigen });
  }

  /**
   * Registra la eliminación de un registro
   */
  static async registrarEliminacion(usuarioId, modulo, id, datos, ipOrigen) {
    const descripcion = `Eliminó ${modulo} [ID: ${id}]: ${JSON.stringify(datos)}`;
    await this.registrar({ usuarioId, descripcion, ipOrigen });
  }

  /**
   * Detecta los cambios entre dos objetos
   */
  static detectarCambios(anterior, nuevo) {
    const cambios = [];
    
    for (const key in nuevo) {
      if (anterior[key] !== nuevo[key]) {
        // Omitir campos sensibles
        if (key === 'password') continue;
        
        cambios.push(`${key}: "${anterior[key]}" → "${nuevo[key]}"`);
      }
    }
    
    return cambios.length > 0 ? cambios.join(', ') : 'Sin cambios significativos';
  }

  /**
   * Obtiene el historial de la bitácora con filtros
   */
  static async obtenerHistorial({ 
    usuarioId = null, 
    fechaInicio = null, 
    fechaFin = null, 
    busqueda = null,
    limite = 100,
    pagina = 1 
  }) {
    const where = {};
    
    if (usuarioId) {
      where.usuarioId = usuarioId;
    }
    
    if (fechaInicio || fechaFin) {
      where.fechaHora = {};
      if (fechaInicio) where.fechaHora.gte = new Date(fechaInicio);
      if (fechaFin) where.fechaHora.lte = new Date(fechaFin);
    }
    
    if (busqueda) {
      where.descripcion = {
        contains: busqueda,
        mode: 'insensitive'
      };
    }
    
    const [registros, total] = await Promise.all([
      prisma.bitacora.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: {
          fechaHora: 'desc'
        },
        take: limite,
        skip: (pagina - 1) * limite
      }),
      prisma.bitacora.count({ where })
    ]);
    
    return {
      registros,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite)
    };
  }
}

export default BitacoraService;
