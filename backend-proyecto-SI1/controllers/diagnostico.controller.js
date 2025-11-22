import prisma from '../config/database.js';

// Obtener todos los diagnósticos con sus detalles
export const getAllDiagnosticos = async (req, res) => {
  try {
    const diagnosticos = await prisma.diagnostico.findMany({
      include: {
        moto: {
          include: {
            marca: true
          }
        },
        empleado: true,
        detalles: {
          orderBy: {
            id: 'asc'
          }
        }
      },
      orderBy: [
        { fecha: 'desc' },
        { hora: 'desc' }
      ]
    });

    // Convertir BigInt anidados a string antes de enviar JSON (maneja todos los casos)
    const diagnosticosJSON = JSON.parse(JSON.stringify(diagnosticos, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json({
      diagnosticos: diagnosticosJSON,
      total: diagnosticosJSON.length
    });
  } catch (error) {
    console.error('Error al obtener diagnósticos:', error);
    res.status(500).json({ 
      error: 'Error al obtener diagnósticos',
      details: error.message 
    });
  }
};

// Obtener diagnóstico por NRO
export const getDiagnosticoById = async (req, res) => {
  try {
    const { nro } = req.params;
    
    const diagnostico = await prisma.diagnostico.findUnique({
      where: { nro: BigInt(nro) },
      include: {
        moto: {
          include: {
            marca: true
          }
        },
        empleado: true,
        detalles: {
          orderBy: {
            id: 'asc'
          }
        }
      }
    });

    if (!diagnostico) {
      return res.status(404).json({ 
        error: 'Diagnóstico no encontrado' 
      });
    }

    // Convertir BigInt a string para JSON
    const diagnosticoJSON = JSON.parse(JSON.stringify(diagnostico, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(diagnosticoJSON);
  } catch (error) {
    console.error('Error al obtener diagnóstico:', error);
    res.status(500).json({ 
      error: 'Error al obtener diagnóstico',
      details: error.message 
    });
  }
};

// Crear diagnóstico con detalles
export const createDiagnostico = async (req, res) => {
  try {
    const { fecha, hora, placaMoto, empleadoCi, detalles } = req.body;

    // Validaciones
    if (!fecha || !hora || !placaMoto || !empleadoCi) {
      return res.status(400).json({ 
        error: 'Fecha, hora, placa de moto y empleado son requeridos' 
      });
    }

    // LÓGICA DE PERMISOS: Si es empleado, solo puede crear diagnósticos para sí mismo
    if (req.userRole === 'Empleado') {
      if (empleadoCi !== req.empleadoCi) {
        return res.status(403).json({ 
          error: 'Los empleados solo pueden crear diagnósticos para sí mismos' 
        });
      }
    }

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ 
        error: 'Debe proporcionar al menos un detalle del diagnóstico' 
      });
    }

    // Validar que todos los detalles tengan descripción
    const detallesValidos = detalles.every(d => d.descripcion && d.descripcion.trim().length > 0);
    if (!detallesValidos) {
      return res.status(400).json({ 
        error: 'Todos los detalles deben tener una descripción válida' 
      });
    }

    // Validar que la moto exista
    const moto = await prisma.moto.findUnique({
      where: { placa: placaMoto }
    });

    if (!moto) {
      return res.status(400).json({ 
        error: 'La moto especificada no existe' 
      });
    }

    // Validar que el empleado exista
    const empleado = await prisma.empleado.findUnique({
      where: { ci: parseInt(empleadoCi) }
    });

    if (!empleado) {
      return res.status(400).json({ 
        error: 'El empleado especificado no existe' 
      });
    }

    // Verificar que no exista un diagnóstico duplicado (misma moto, fecha y hora)
    const diagnosticoExistente = await prisma.diagnostico.findFirst({
      where: {
        placaMoto,
        fecha: new Date(fecha),
        hora: new Date(`1970-01-01T${hora}`)
      }
    });

    if (diagnosticoExistente) {
      return res.status(400).json({ 
        error: 'Ya existe un diagnóstico para esta moto en la misma fecha y hora' 
      });
    }

    // Crear diagnóstico con detalles en una transacción
    const nuevoDiagnostico = await prisma.diagnostico.create({
      data: {
        fecha: new Date(fecha),
        hora: new Date(`1970-01-01T${hora}`),
        placaMoto,
        empleadoCi: parseInt(empleadoCi),
        detalles: {
          create: detalles.map(detalle => ({
            descripcion: detalle.descripcion.trim()
          }))
        }
      },
      include: {
        moto: {
          include: {
            marca: true
          }
        },
        empleado: true,
        detalles: true
      }
    });

    // Convertir BigInt a string para JSON
    const nuevoDiagnosticoJSON = JSON.parse(JSON.stringify(nuevoDiagnostico, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.status(201).json({
      message: 'Diagnóstico creado exitosamente',
      diagnostico: nuevoDiagnosticoJSON
    });
  } catch (error) {
    console.error('Error al crear diagnóstico:', error);
    res.status(500).json({ 
      error: 'Error al crear diagnóstico',
      details: error.message 
    });
  }
};

// Actualizar diagnóstico con detalles
export const updateDiagnostico = async (req, res) => {
  try {
    const { nro } = req.params;
    const { fecha, hora, placaMoto, empleadoCi, detalles } = req.body;

    // Validar que el diagnóstico exista
    const diagnosticoExistente = await prisma.diagnostico.findUnique({
      where: { nro: BigInt(nro) },
      include: { detalles: true }
    });

    if (!diagnosticoExistente) {
      return res.status(404).json({ 
        error: 'Diagnóstico no encontrado' 
      });
    }

    // Validar detalles si se proporcionan
    if (detalles && Array.isArray(detalles)) {
      if (detalles.length === 0) {
        return res.status(400).json({ 
          error: 'Debe proporcionar al menos un detalle del diagnóstico' 
        });
      }

      const detallesValidos = detalles.every(d => d.descripcion && d.descripcion.trim().length > 0);
      if (!detallesValidos) {
        return res.status(400).json({ 
          error: 'Todos los detalles deben tener una descripción válida' 
        });
      }
    }

    // Actualizar en transacción
    const diagnosticoActualizado = await prisma.$transaction(async (prisma) => {
      // Si se proporcionan detalles, eliminar los anteriores y crear los nuevos
      if (detalles && Array.isArray(detalles)) {
        await prisma.detalleDiagnostico.deleteMany({
          where: { diagnosticoId: BigInt(nro) }
        });
      }

      // Actualizar el diagnóstico
      const updated = await prisma.diagnostico.update({
        where: { nro: BigInt(nro) },
        data: {
          fecha: fecha ? new Date(fecha) : diagnosticoExistente.fecha,
          hora: hora ? new Date(`1970-01-01T${hora}`) : diagnosticoExistente.hora,
          placaMoto: placaMoto || diagnosticoExistente.placaMoto,
          empleadoCi: empleadoCi ? parseInt(empleadoCi) : diagnosticoExistente.empleadoCi,
          ...(detalles && Array.isArray(detalles) && {
            detalles: {
              create: detalles.map(detalle => ({
                descripcion: detalle.descripcion.trim()
              }))
            }
          })
        },
        include: {
          moto: {
            include: {
              marca: true
            }
          },
          empleado: true,
          detalles: {
            orderBy: {
              id: 'asc'
            }
          }
        }
      });

      return updated;
    });

    // Convertir BigInt a string para JSON
    const diagnosticoActualizadoJSON = JSON.parse(JSON.stringify(diagnosticoActualizado, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json({
      message: 'Diagnóstico actualizado exitosamente',
      diagnostico: diagnosticoActualizadoJSON
    });
  } catch (error) {
    console.error('Error al actualizar diagnóstico:', error);
    res.status(500).json({ 
      error: 'Error al actualizar diagnóstico',
      details: error.message 
    });
  }
};

// Eliminar diagnóstico (eliminará automáticamente los detalles por CASCADE)
export const deleteDiagnostico = async (req, res) => {
  try {
    const { nro } = req.params;

    await prisma.diagnostico.delete({
      where: { nro: BigInt(nro) }
    });

    res.json({
      message: 'Diagnóstico eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar diagnóstico:', error);
    res.status(500).json({ 
      error: 'Error al eliminar diagnóstico',
      details: error.message 
    });
  }
};
