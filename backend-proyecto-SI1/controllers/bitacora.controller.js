import BitacoraService from '../services/bitacora.service.js';
import prisma from '../config/database.js';

// Obtener historial de bitácora
export const getBitacora = async (req, res) => {
  try {
    const { 
      usuarioId, 
      fechaInicio, 
      fechaFin, 
      busqueda, 
      limite = 50, 
      pagina = 1 
    } = req.query;

    const resultado = await BitacoraService.obtenerHistorial({
      usuarioId: usuarioId ? parseInt(usuarioId) : null,
      fechaInicio,
      fechaFin,
      busqueda,
      limite: parseInt(limite),
      pagina: parseInt(pagina)
    });

    // Convertir BigInt a String para evitar error de serialización
    const resultadoConvertido = {
      ...resultado,
      registros: resultado.registros.map(r => ({
        ...r,
        id: r.id.toString()
      }))
    };

    res.json(resultadoConvertido);
  } catch (error) {
    console.error('Error al obtener bitácora:', error);
    res.status(500).json({ 
      error: 'Error al obtener bitácora',
      details: error.message 
    });
  }
};

// Obtener estadísticas de la bitácora
export const getEstadisticas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    const where = {};
    if (fechaInicio || fechaFin) {
      where.fechaHora = {};
      if (fechaInicio) where.fechaHora.gte = new Date(fechaInicio);
      if (fechaFin) where.fechaHora.lte = new Date(fechaFin);
    }

    const [
      totalAcciones,
      accionesPorUsuario,
      accionesPorTipo
    ] = await Promise.all([
      prisma.bitacora.count({ where }),
      
      prisma.bitacora.groupBy({
        by: ['usuarioId'],
        where,
        _count: true,
        orderBy: {
          _count: {
            usuarioId: 'desc'
          }
        },
        take: 10
      }),
      
      prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN "DESCRIPCION" LIKE 'Creó%' THEN 'Creación'
            WHEN "DESCRIPCION" LIKE 'Actualizó%' THEN 'Actualización'
            WHEN "DESCRIPCION" LIKE 'Eliminó%' THEN 'Eliminación'
            WHEN "DESCRIPCION" LIKE 'Inicio de sesión%' THEN 'Inicio de sesión'
            WHEN "DESCRIPCION" LIKE 'Cierre de sesión%' THEN 'Cierre de sesión'
            ELSE 'Otro'
          END as tipo,
          COUNT(*) as cantidad
        FROM "BITACORA"
        ${fechaInicio || fechaFin ? 'WHERE' : ''}
        ${fechaInicio ? `"FECHA_HORA" >= ${fechaInicio}` : ''}
        ${fechaInicio && fechaFin ? 'AND' : ''}
        ${fechaFin ? `"FECHA_HORA" <= ${fechaFin}` : ''}
        GROUP BY tipo
        ORDER BY cantidad DESC
      `
    ]);

    // Obtener información de usuarios
    const usuariosIds = accionesPorUsuario.map(a => a.usuarioId);
    const usuarios = await prisma.usuario.findMany({
      where: { id: { in: usuariosIds } },
      select: { id: true, username: true }
    });

    const accionesPorUsuarioDetalle = accionesPorUsuario.map(accion => {
      const usuario = usuarios.find(u => u.id === accion.usuarioId);
      return {
        usuario: usuario?.username || 'Desconocido',
        cantidad: accion._count
      };
    });

    res.json({
      totalAcciones,
      accionesPorUsuario: accionesPorUsuarioDetalle,
      accionesPorTipo
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas',
      details: error.message 
    });
  }
};

// Exportar bitácora a CSV
export const exportarBitacora = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    const where = {};
    if (fechaInicio || fechaFin) {
      where.fechaHora = {};
      if (fechaInicio) where.fechaHora.gte = new Date(fechaInicio);
      if (fechaFin) where.fechaHora.lte = new Date(fechaFin);
    }

    const registros = await prisma.bitacora.findMany({
      where,
      include: {
        usuario: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        fechaHora: 'desc'
      }
    });

    // Generar CSV
    const csvHeader = 'ID,Usuario,Email,Descripción,Fecha/Hora,IP Origen\n';
    const csvRows = registros.map(r => 
      `${r.id},"${r.usuario.username}","${r.usuario.email}","${r.descripcion.replace(/"/g, '""')}","${r.fechaHora.toISOString()}","${r.ipOrigen || 'N/A'}"`
    ).join('\n');
    
    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=bitacora_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Error al exportar bitácora:', error);
    res.status(500).json({ 
      error: 'Error al exportar bitácora',
      details: error.message 
    });
  }
};
