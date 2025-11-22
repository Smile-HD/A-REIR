import prisma from '../config/database.js';

// Obtener todas las proformas (solo datos principales)
export const getAllProformas = async (req, res) => {
  try {
    const proformas = await prisma.proforma.findMany({
      include: {
        cliente: {
          select: {
            ci: true,
            nombre: true,
            apellidos: true
          }
        },
        diagnostico: {
          select: {
            nro: true,
            fecha: true,
            moto: {
              select: {
                placa: true,
                modelo: true
              }
            }
          }
        },
        detalles: {
          include: {
            servicio: {
              select: {
                id: true,
                descripcion: true
              }
            }
          }
        },
        repuestos: true,
        _count: {
          select: {
            detalles: true,
            repuestos: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Convertir cualquier BigInt anidado a string antes de enviar JSON
    const proformasJSON = JSON.parse(JSON.stringify(proformas, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json({
      proformas: proformasJSON,
      total: proformasJSON.length
    });
  } catch (error) {
    console.error('Error al obtener proformas:', error);
    res.status(500).json({ 
      error: 'Error al obtener proformas',
      details: error.message 
    });
  }
};

// Obtener proforma por ID con TODOS los detalles completos
export const getProformaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const proforma = await prisma.proforma.findUnique({
      where: { id: BigInt(id) },
      include: {
        cliente: true,
        diagnostico: {
          include: {
            moto: {
              include: {
                marca: true
              }
            },
            empleado: true,
            detalles: true
          }
        },
        detalles: {
          include: {
            servicio: {
              include: {
                categoria: true
              }
            }
          },
          orderBy: {
            id: 'asc'
          }
        },
        repuestos: {
          orderBy: {
            id: 'asc'
          }
        }
      }
    });

    if (!proforma) {
      return res.status(404).json({ error: 'Proforma no encontrada' });
    }

    // Convertir BigInt a string para JSON
    const proformaJSON = JSON.parse(JSON.stringify(proforma, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(proformaJSON);
  } catch (error) {
    console.error('Error al obtener proforma:', error);
    res.status(500).json({ 
      error: 'Error al obtener proforma',
      details: error.message 
    });
  }
};

// Crear nueva proforma
export const createProforma = async (req, res) => {
  try {
    const { fecha, clienteCi, diagnosticoId, detalles, repuestos } = req.body;

    // Validaciones
    if (!fecha || !clienteCi) {
      return res.status(400).json({ 
        error: 'Fecha y cliente son requeridos' 
      });
    }

    if (!detalles || detalles.length === 0) {
      return res.status(400).json({ 
        error: 'Debe incluir al menos un detalle en la proforma' 
      });
    }

    // Validar que el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { ci: parseInt(clienteCi) }
    });

    if (!cliente) {
      return res.status(400).json({ 
        error: 'Cliente no encontrado' 
      });
    }

    // Validar diagnóstico si se proporciona
    if (diagnosticoId) {
      const diagnostico = await prisma.diagnostico.findUnique({
        where: { nro: BigInt(diagnosticoId) }
      });

      if (!diagnostico) {
        return res.status(400).json({ 
          error: 'Diagnóstico no encontrado' 
        });
      }

      // Verificar que el diagnóstico no esté ya asociado a otra proforma
      const proformaExistente = await prisma.proforma.findFirst({
        where: { diagnosticoId: BigInt(diagnosticoId) }
      });

      if (proformaExistente) {
        return res.status(400).json({ 
          error: 'Este diagnóstico ya tiene una proforma asociada' 
        });
      }
    }

    // Calcular total
    let total = 0;
    const detallesFormateados = detalles.map(detalle => {
      const cantidad = parseFloat(detalle.cantidad);
      const precioUnit = parseFloat(detalle.precioUnit);
      const subtotal = Math.round(cantidad * precioUnit * 100) / 100;
      total += subtotal;

      return {
        servicio: detalle.servicioId ? {
         connect: { id: parseInt(detalle.servicioId) }
        } : undefined,
        descripcion: detalle.descripcion,
        cantidad: cantidad,
        precioUnit: precioUnit
      };
    });

    // Crear la proforma con todos sus detalles y repuestos
    const nuevaProforma = await prisma.proforma.create({
      data: {
        fecha: new Date(fecha),
        clienteCi: parseInt(clienteCi),
        diagnosticoId: diagnosticoId ? BigInt(diagnosticoId) : null,
        total: total,
        detalles: {
          create: detallesFormateados
        },
        repuestos: repuestos && repuestos.length > 0 ? {
          create: repuestos.map(r => ({
            nombre: r.nombre
          }))
        } : undefined
      },
      include: {
        cliente: true,
        diagnostico: true,
        detalles: {
          include: {
            servicio: true
          }
        },
        repuestos: true
      }
    });

    // Convertir BigInt a string para JSON
    const proformaJSON = JSON.parse(JSON.stringify(nuevaProforma, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.status(201).json({
      message: 'Proforma creada exitosamente',
      proforma: proformaJSON
    });
  } catch (error) {
    console.error('Error al crear proforma:', error);
    res.status(500).json({ 
      error: 'Error al crear proforma',
      details: error.message 
    });
  }
};

// Actualizar proforma
export const updateProforma = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, estado, clienteCi, diagnosticoId, detalles, repuestos } = req.body;

    console.log('Actualizando proforma:', { id, detalles: detalles?.length, repuestos: repuestos?.length });

    // Verificar que la proforma existe
    const proformaExistente = await prisma.proforma.findUnique({
      where: { id: BigInt(id) }
    });

    if (!proformaExistente) {
      return res.status(404).json({ error: 'Proforma no encontrada' });
    }

    // Calcular nuevo total si se actualizan detalles
    let total = proformaExistente.total;
    
    if (detalles && detalles.length > 0) {
      total = 0;
      detalles.forEach(detalle => {
        const cantidad = parseFloat(detalle.cantidad);
        const precioUnit = parseFloat(detalle.precioUnit);
        total += Math.round(cantidad * precioUnit * 100) / 100;
      });
    }

    // Preparar datos de actualización base
    const updateData = {};
    
    if (fecha) updateData.fecha = new Date(fecha);
    if (estado) updateData.estado = estado;
    if (clienteCi) updateData.clienteCi = parseInt(clienteCi);
    if (diagnosticoId !== undefined) {
      updateData.diagnosticoId = diagnosticoId ? BigInt(diagnosticoId) : null;
    }
    updateData.total = total;

    // Si se actualizan detalles, verificar cuáles están en uso y actualizarlos/crearlos apropiadamente
    if (detalles && Array.isArray(detalles) && detalles.length > 0) {
      console.log('Procesando detalles:', detalles);
      
      // Obtener detalles actuales
      const detallesActuales = await prisma.detalleProforma.findMany({
        where: { proformaId: BigInt(id) },
        include: {
          ordenesTrabajo: true
        }
      });

      console.log('Detalles actuales:', detallesActuales.length);

      // Separar detalles que tienen órdenes de trabajo asociadas (no se pueden eliminar)
      const detallesConOrdenes = detallesActuales.filter(d => d.ordenesTrabajo.length > 0);
      const detallesSinOrdenes = detallesActuales.filter(d => d.ordenesTrabajo.length === 0);

      console.log('Detalles con órdenes:', detallesConOrdenes.length, 'Sin órdenes:', detallesSinOrdenes.length);

      // Eliminar solo los detalles que NO tienen órdenes de trabajo
      if (detallesSinOrdenes.length > 0) {
        await prisma.detalleProforma.deleteMany({
          where: {
            id: { in: detallesSinOrdenes.map(d => d.id) }
          }
        });
        console.log('Detalles eliminados:', detallesSinOrdenes.length);
      }

      // Crear los nuevos detalles
      const detallesParaCrear = detalles.map(detalle => {
        const cantidad = parseFloat(detalle.cantidad) || 1;
        const precioUnit = parseFloat(detalle.precioUnit) || 0;

        return {
          servicioId: detalle.servicioId ? parseInt(detalle.servicioId) : null,
          descripcion: detalle.descripcion || 'Sin descripción',
          cantidad: cantidad,
          precioUnit: precioUnit
        };
      });

      console.log('Creando nuevos detalles:', detallesParaCrear.length);

      updateData.detalles = {
        create: detallesParaCrear
      };
    }

    // Si se actualizan repuestos, eliminar los antiguos y crear los nuevos
    if (repuestos !== undefined && Array.isArray(repuestos)) {
      console.log('Procesando repuestos:', repuestos.length);
      
      await prisma.proformaRepuesto.deleteMany({
        where: { proformaId: BigInt(id) }
      });

      if (repuestos.length > 0) {
        updateData.repuestos = {
          create: repuestos.map(r => ({
            nombre: r.nombre || 'Sin nombre'
          }))
        };
      }
    }

    const proformaActualizada = await prisma.proforma.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        cliente: true,
        diagnostico: true,
        detalles: {
          include: {
            servicio: true
          }
        },
        repuestos: true
      }
    });

    // Convertir BigInt a string para JSON
    const proformaJSON = JSON.parse(JSON.stringify(proformaActualizada, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json({
      message: 'Proforma actualizada exitosamente',
      proforma: proformaJSON
    });
  } catch (error) {
    console.error('Error al actualizar proforma:', error);
    res.status(500).json({ 
      error: 'Error al actualizar proforma',
      details: error.message 
    });
  }
};

// Cambiar estado de la proforma
export const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ 
        error: 'El estado es requerido' 
      });
    }

    const estadosValidos = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'COMPLETADA'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        error: 'Estado inválido. Valores permitidos: PENDIENTE, APROBADA, RECHAZADA, COMPLETADA' 
      });
    }

    const proforma = await prisma.proforma.update({
      where: { id: BigInt(id) },
      data: { estado },
      include: {
        cliente: true
      }
    });

    // Convertir BigInt a string para JSON
    const proformaJSON = JSON.parse(JSON.stringify(proforma, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json({
      message: 'Estado actualizado exitosamente',
      proforma: proformaJSON
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ 
      error: 'Error al cambiar estado',
      details: error.message 
    });
  }
};

// Eliminar proforma
export const deleteProforma = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la proforma existe
    const proforma = await prisma.proforma.findUnique({
      where: { id: BigInt(id) }
    });

    if (!proforma) {
      return res.status(404).json({ error: 'Proforma no encontrada' });
    }

    // Eliminar la proforma (los detalles se eliminan automáticamente por CASCADE)
    await prisma.proforma.delete({
      where: { id: BigInt(id) }
    });

    res.json({
      message: 'Proforma eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar proforma:', error);
    res.status(500).json({ 
      error: 'Error al eliminar proforma',
      details: error.message 
    });
  }
};
