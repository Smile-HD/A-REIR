import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Obtener todas las comisiones
const getAllComisiones = async (req, res) => {
  try {
    const comisiones = await prisma.comision.findMany({
      include: {
        ordenTrabajo: {
          include: {
            empleado: {
              select: {
                ci: true,
                nombre: true,
                apellidos: true,
                telefono: true
              }
            },
            detalle: {
              include: {
                servicio: true,
                proforma: {
                  include: {
                    cliente: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });
    
    // Convertir BigInt a string antes de enviar JSON
    const comisionesJSON = JSON.parse(JSON.stringify(comisiones, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    res.json(comisionesJSON);
  } catch (error) {
    console.error('Error al obtener comisiones:', error);
    res.status(500).json({ error: 'Error al obtener comisiones' });
  }
};

// Obtener una comisión por ID
const getComisionById = async (req, res) => {
  try {
    const { id } = req.params;
    const comision = await prisma.comision.findUnique({
      where: { id: parseInt(id) },
      include: {
        ordenTrabajo: {
          include: {
            empleado: {
              select: {
                ci: true,
                nombre: true,
                apellidos: true,
                telefono: true
              }
            },
            detalle: {
              include: {
                servicio: true,
                proforma: {
                  include: {
                    cliente: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!comision) {
      return res.status(404).json({ error: 'Comisión no encontrada' });
    }

    // Convertir BigInt a string antes de enviar JSON
    const comisionJSON = JSON.parse(JSON.stringify(comision, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(comisionJSON);
  } catch (error) {
    console.error('Error al obtener comisión:', error);
    res.status(500).json({ error: 'Error al obtener comisión' });
  }
};

// Crear nueva comisión
const createComision = async (req, res) => {
  try {
    const { ordenId, estadoPago, fechaPago } = req.body;

    // Validación: la orden de trabajo es obligatoria
    if (!ordenId) {
      return res.status(400).json({ 
        error: 'La orden de trabajo es obligatoria para generar una comisión' 
      });
    }

    // Verificar que la orden de trabajo existe y obtener su detalle
    const orden = await prisma.ordenTrabajo.findUnique({
      where: { id: parseInt(ordenId) },
      include: {
        detalle: {
          include: {
            proforma: true
          }
        }
      }
    });

    if (!orden) {
      return res.status(404).json({ error: 'Orden de trabajo no encontrada' });
    }

    // Verificar que la orden esté finalizada
    if (orden.estado !== 'FINALIZADA') {
      return res.status(400).json({ 
        error: 'Solo se pueden generar comisiones para órdenes finalizadas' 
      });
    }

    // Verificar que no exista ya una comisión para esta orden
    const comisionExistente = await prisma.comision.findFirst({
      where: { ordenId: parseInt(ordenId) }
    });

    if (comisionExistente) {
      return res.status(400).json({ 
        error: 'Ya existe una comisión para esta orden de trabajo' 
      });
    }

    // Calcular el monto como la mitad del total de la proforma
    const totalProforma = orden.detalle?.proforma?.total || 0;
    const montoComision = totalProforma / 2;

    const nuevaComision = await prisma.comision.create({
      data: {
        ordenId: parseInt(ordenId),
        monto: montoComision,
        estadoPago: estadoPago || 'PENDIENTE',
        fechaPago: fechaPago ? new Date(fechaPago) : new Date()
      },
      include: {
        ordenTrabajo: {
          include: {
            empleado: {
              select: {
                ci: true,
                nombre: true,
                apellidos: true
              }
            }
          }
        }
      }
    });

    // Convertir BigInt a string antes de enviar JSON
    const nuevaComisionJSON = JSON.parse(JSON.stringify(nuevaComision, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.status(201).json(nuevaComisionJSON);
  } catch (error) {
    console.error('Error al crear comisión:', error);
    res.status(500).json({ error: 'Error al crear comisión' });
  }
};

// Actualizar comisión
const updateComision = async (req, res) => {
  try {
    const { id } = req.params;
    const { ordenId, monto, estadoPago, fechaPago } = req.body;

    // Verificar que la comisión existe
    const comisionExistente = await prisma.comision.findUnique({
      where: { id: parseInt(id) }
    });

    if (!comisionExistente) {
      return res.status(404).json({ error: 'Comisión no encontrada' });
    }

    // Validar monto si se proporciona
    if (monto !== undefined && parseFloat(monto) < 0) {
      return res.status(400).json({ 
        error: 'El monto debe ser mayor o igual a 0' 
      });
    }

    // Verificar orden si se proporciona
    if (ordenId !== undefined && ordenId !== null) {
      const orden = await prisma.ordenTrabajo.findUnique({
        where: { id: parseInt(ordenId) }
      });

      if (!orden) {
        return res.status(404).json({ error: 'Orden de trabajo no encontrada' });
      }

      if (orden.estado !== 'FINALIZADA') {
        return res.status(400).json({ 
          error: 'Solo se pueden asociar comisiones a órdenes finalizadas' 
        });
      }

      // Verificar que no exista otra comisión para esta orden
      if (parseInt(ordenId) !== comisionExistente.ordenId) {
        const comisionConOrden = await prisma.comision.findFirst({
          where: { 
            ordenId: parseInt(ordenId),
            id: { not: parseInt(id) }
          }
        });

        if (comisionConOrden) {
          return res.status(400).json({ 
            error: 'Ya existe otra comisión para esta orden de trabajo' 
          });
        }
      }
    }

    const dataToUpdate = {};
    if (ordenId !== undefined) dataToUpdate.ordenId = ordenId ? parseInt(ordenId) : null;
    if (monto !== undefined) dataToUpdate.monto = parseFloat(monto);
    if (estadoPago !== undefined) dataToUpdate.estadoPago = estadoPago;
    if (fechaPago !== undefined) dataToUpdate.fechaPago = new Date(fechaPago);

    const comisionActualizada = await prisma.comision.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      include: {
        ordenTrabajo: {
          include: {
            empleado: {
              select: {
                ci: true,
                nombre: true,
                apellidos: true
              }
            }
          }
        }
      }
    });

    // Convertir BigInt a string antes de enviar JSON
    const comisionJSON = JSON.parse(JSON.stringify(comisionActualizada, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(comisionJSON);
  } catch (error) {
    console.error('Error al actualizar comisión:', error);
    res.status(500).json({ error: 'Error al actualizar comisión' });
  }
};

// Eliminar comisión
const deleteComision = async (req, res) => {
  try {
    const { id } = req.params;

    const comision = await prisma.comision.findUnique({
      where: { id: parseInt(id) }
    });

    if (!comision) {
      return res.status(404).json({ error: 'Comisión no encontrada' });
    }

    await prisma.comision.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Comisión eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar comisión:', error);
    res.status(500).json({ error: 'Error al eliminar comisión' });
  }
};

// Obtener comisiones por estado de pago
const getComisionesByEstadoPago = async (req, res) => {
  try {
    const { estado } = req.params;
    
    const comisiones = await prisma.comision.findMany({
      where: { estadoPago: estado },
      include: {
        ordenTrabajo: {
          include: {
            empleado: true,
            detalle: {
              include: {
                servicio: true,
                proforma: {
                  include: {
                    cliente: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        fechaPago: 'desc'
      }
    });

    // Convertir BigInt a string antes de enviar JSON
    const comisionesJSON = JSON.parse(JSON.stringify(comisiones, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(comisionesJSON);
  } catch (error) {
    console.error('Error al obtener comisiones por estado:', error);
    res.status(500).json({ error: 'Error al obtener comisiones por estado' });
  }
};

// Obtener comisión por orden de trabajo
const getComisionByOrden = async (req, res) => {
  try {
    const { ordenId } = req.params;
    
    const comision = await prisma.comision.findFirst({
      where: { ordenId: parseInt(ordenId) },
      include: {
        ordenTrabajo: {
          include: {
            empleado: true,
            detalle: {
              include: {
                servicio: true,
                proforma: true
              }
            }
          }
        }
      }
    });

    if (!comision) {
      return res.status(404).json({ error: 'No se encontró comisión para esta orden' });
    }

    // Convertir BigInt a string antes de enviar JSON
    const comisionJSON = JSON.parse(JSON.stringify(comision, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(comisionJSON);
  } catch (error) {
    console.error('Error al obtener comisión por orden:', error);
    res.status(500).json({ error: 'Error al obtener comisión por orden' });
  }
};

// Marcar comisión como pagada
const marcarComoPagada = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaPago } = req.body;

    const comision = await prisma.comision.findUnique({
      where: { id: parseInt(id) }
    });

    if (!comision) {
      return res.status(404).json({ error: 'Comisión no encontrada' });
    }

    if (comision.estadoPago === 'PAGADO') {
      return res.status(400).json({ error: 'Esta comisión ya fue pagada' });
    }

    const comisionActualizada = await prisma.comision.update({
      where: { id: parseInt(id) },
      data: {
        estadoPago: 'PAGADO',
        fechaPago: fechaPago ? new Date(fechaPago) : new Date()
      },
      include: {
        ordenTrabajo: {
          include: {
            empleado: true
          }
        }
      }
    });

    // Convertir BigInt a string antes de enviar JSON
    const comisionJSON = JSON.parse(JSON.stringify(comisionActualizada, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(comisionJSON);
  } catch (error) {
    console.error('Error al marcar comisión como pagada:', error);
    res.status(500).json({ error: 'Error al marcar comisión como pagada' });
  }
};

export {
  getAllComisiones,
  getComisionById,
  createComision,
  updateComision,
  deleteComision,
  getComisionesByEstadoPago,
  getComisionByOrden,
  marcarComoPagada
};
