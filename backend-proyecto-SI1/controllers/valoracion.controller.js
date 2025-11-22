import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todas las valoraciones (para empleados)
export const getAllValoraciones = async (req, res) => {
  try {
    const valoraciones = await prisma.valoracion.findMany({
      orderBy: {
        fecha: 'desc'
      }
    });

    res.json({
      valoraciones,
      total: valoraciones.length
    });
  } catch (error) {
    console.error('Error al obtener valoraciones:', error);
    res.status(500).json({ 
      error: 'Error al obtener valoraciones',
      details: error.message 
    });
  }
};

// Obtener estadísticas de valoraciones (para empleados)
export const getEstadisticasValoraciones = async (req, res) => {
  try {
    const valoraciones = await prisma.valoracion.findMany();

    const totalValoraciones = valoraciones.length;
    const promedioCalificacion = totalValoraciones > 0
      ? valoraciones.reduce((sum, v) => sum + v.calificacion, 0) / totalValoraciones
      : 0;

    const distribucion = {
      cinco: valoraciones.filter(v => v.calificacion === 5).length,
      cuatro: valoraciones.filter(v => v.calificacion === 4).length,
      tres: valoraciones.filter(v => v.calificacion === 3).length,
      dos: valoraciones.filter(v => v.calificacion === 2).length,
      uno: valoraciones.filter(v => v.calificacion === 1).length,
    };

    res.json({
      totalValoraciones,
      promedioCalificacion: promedioCalificacion.toFixed(2),
      distribucion
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas',
      details: error.message 
    });
  }
};

// Crear valoración (pública, sin autenticación)
export const crearValoracion = async (req, res) => {
  try {
    const { nombre, correo, calificacion, comentario } = req.body;
    const ipCliente = req.ip || req.connection.remoteAddress || 'unknown';

    // Validaciones
    if (!calificacion || calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ 
        error: 'La calificación debe ser un número entre 1 y 5' 
      });
    }

    // Verificar si ya existe una valoración desde esta IP en las últimas 24 horas
    const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const valoracionReciente = await prisma.valoracion.findFirst({
      where: {
        ipCliente: ipCliente,
        fecha: {
          gte: hace24Horas
        }
      }
    });

    if (valoracionReciente) {
      return res.status(429).json({ 
        error: 'Solo puedes enviar una valoración por día. Por favor, intenta mañana.',
        proximaValoracion: new Date(valoracionReciente.fecha.getTime() + 24 * 60 * 60 * 1000)
      });
    }

    // Crear la valoración
    const nuevaValoracion = await prisma.valoracion.create({
      data: {
        nombre: nombre || 'Anónimo',
        correo: correo || null,
        calificacion: parseInt(calificacion),
        comentario: comentario || null,
        ipCliente: ipCliente
      }
    });

    res.status(201).json({
      message: '¡Gracias por tu valoración!',
      valoracion: nuevaValoracion
    });
  } catch (error) {
    console.error('Error al crear valoración:', error);
    res.status(500).json({ 
      error: 'Error al crear valoración',
      details: error.message 
    });
  }
};

// Eliminar valoración (solo para empleados)
export const deleteValoracion = async (req, res) => {
  try {
    const { id } = req.params;

    const valoracion = await prisma.valoracion.findUnique({
      where: { id: parseInt(id) }
    });

    if (!valoracion) {
      return res.status(404).json({ error: 'Valoración no encontrada' });
    }

    await prisma.valoracion.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Valoración eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar valoración:', error);
    res.status(500).json({ 
      error: 'Error al eliminar valoración',
      details: error.message 
    });
  }
};
