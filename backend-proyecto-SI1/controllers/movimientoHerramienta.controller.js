import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los movimientos de herramientas
export const getAllMovimientosHerramienta = async (req, res) => {
  try {
    const movimientos = await prisma.movimientoHerramienta.findMany({
      include: {
        herramienta: {
          include: {
            marca: true
          }
        },
        ordenTrabajo: {
          include: {
            empleado: true,
            detalle: {
              include: {
                servicio: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Convertir BigInt a string antes de enviar JSON
    const movimientosJSON = JSON.parse(JSON.stringify(movimientos, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(movimientosJSON);
  } catch (error) {
    console.error('Error al obtener movimientos de herramientas:', error);
    res.status(500).json({ 
      error: 'Error al obtener movimientos de herramientas',
      details: error.message 
    });
  }
};

// Obtener movimientos por orden de trabajo
export const getMovimientosByOrden = async (req, res) => {
  try {
    const { ordenTrabajoId } = req.params;
    
    const movimientos = await prisma.movimientoHerramienta.findMany({
      where: { ordenTrabajoId: parseInt(ordenTrabajoId) },
      include: {
        herramienta: {
          include: {
            marca: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Convertir BigInt a string antes de enviar JSON
    const movimientosJSON = JSON.parse(JSON.stringify(movimientos, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(movimientosJSON);
  } catch (error) {
    console.error('Error al obtener movimientos por orden:', error);
    res.status(500).json({ 
      error: 'Error al obtener movimientos por orden',
      details: error.message 
    });
  }
};

// Obtener movimientos por herramienta
export const getMovimientosByHerramienta = async (req, res) => {
  try {
    const { herramientaId } = req.params;
    
    const movimientos = await prisma.movimientoHerramienta.findMany({
      where: { herramientaId: parseInt(herramientaId) },
      include: {
        ordenTrabajo: {
          include: {
            empleado: true,
            detalle: {
              include: {
                servicio: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Convertir BigInt a string antes de enviar JSON
    const movimientosJSON = JSON.parse(JSON.stringify(movimientos, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(movimientosJSON);
  } catch (error) {
    console.error('Error al obtener movimientos por herramienta:', error);
    res.status(500).json({ 
      error: 'Error al obtener movimientos por herramienta',
      details: error.message 
    });
  }
};

// Obtener un movimiento específico
export const getMovimientoById = async (req, res) => {
  try {
    const { ordenTrabajoId, herramientaId } = req.params;
    
    const movimiento = await prisma.movimientoHerramienta.findUnique({
      where: {
        ordenTrabajoId_herramientaId: {
          ordenTrabajoId: parseInt(ordenTrabajoId),
          herramientaId: parseInt(herramientaId)
        }
      },
      include: {
        herramienta: {
          include: {
            marca: true
          }
        },
        ordenTrabajo: {
          include: {
            empleado: true,
            detalle: {
              include: {
                servicio: true
              }
            }
          }
        }
      }
    });

    if (!movimiento) {
      return res.status(404).json({ error: 'Movimiento de herramienta no encontrado' });
    }

    // Convertir BigInt a string antes de enviar JSON
    const movimientoJSON = JSON.parse(JSON.stringify(movimiento, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(movimientoJSON);
  } catch (error) {
    console.error('Error al obtener movimiento:', error);
    res.status(500).json({ 
      error: 'Error al obtener movimiento',
      details: error.message 
    });
  }
};

// Crear un nuevo movimiento de herramienta
export const createMovimientoHerramienta = async (req, res) => {
  try {
    const { ordenTrabajoId, herramientaId, fecha, cantidad } = req.body;

    // Validaciones
    if (!ordenTrabajoId) {
      return res.status(400).json({ error: 'La orden de trabajo es obligatoria' });
    }

    if (!herramientaId) {
      return res.status(400).json({ error: 'La herramienta es obligatoria' });
    }

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    const fechaMovimiento = fecha ? new Date(fecha) : new Date();
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);

    if (fechaMovimiento > hoy) {
      return res.status(400).json({ error: 'La fecha del movimiento no puede ser futura' });
    }

    // Verificar que la orden de trabajo existe
    const ordenExiste = await prisma.ordenTrabajo.findUnique({
      where: { id: parseInt(ordenTrabajoId) }
    });

    if (!ordenExiste) {
      return res.status(404).json({ error: 'La orden de trabajo especificada no existe' });
    }

    // Verificar que la herramienta existe
    const herramientaExiste = await prisma.herramienta.findUnique({
      where: { id: parseInt(herramientaId) }
    });

    if (!herramientaExiste) {
      return res.status(404).json({ error: 'La herramienta especificada no existe' });
    }

    // Verificar si ya existe un movimiento para esta orden y herramienta
    const movimientoExistente = await prisma.movimientoHerramienta.findUnique({
      where: {
        ordenTrabajoId_herramientaId: {
          ordenTrabajoId: parseInt(ordenTrabajoId),
          herramientaId: parseInt(herramientaId)
        }
      }
    });

    if (movimientoExistente) {
      return res.status(400).json({ 
        error: 'Ya existe un movimiento de esta herramienta para esta orden de trabajo. Use la actualización para modificar la cantidad.' 
      });
    }

    const movimiento = await prisma.movimientoHerramienta.create({
      data: {
        ordenTrabajoId: parseInt(ordenTrabajoId),
        herramientaId: parseInt(herramientaId),
        fecha: fechaMovimiento,
        cantidad: parseInt(cantidad)
      },
      include: {
        herramienta: {
          include: {
            marca: true
          }
        },
        ordenTrabajo: {
          include: {
            empleado: true,
            detalle: {
              include: {
                servicio: true
              }
            }
          }
        }
      }
    });

    // Convertir BigInt a string antes de enviar JSON
    const movimientoJSON = JSON.parse(JSON.stringify(movimiento, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.status(201).json(movimientoJSON);
  } catch (error) {
    console.error('Error al crear movimiento de herramienta:', error);
    res.status(500).json({ 
      error: 'Error al crear movimiento de herramienta',
      details: error.message 
    });
  }
};

// Actualizar un movimiento de herramienta
export const updateMovimientoHerramienta = async (req, res) => {
  try {
    const { ordenTrabajoId, herramientaId } = req.params;
    const { fecha, cantidad } = req.body;

    // Validaciones
    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    if (fecha) {
      const fechaMovimiento = new Date(fecha);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);

      if (fechaMovimiento > hoy) {
        return res.status(400).json({ error: 'La fecha del movimiento no puede ser futura' });
      }
    }

    // Verificar si existe el movimiento
    const movimientoExiste = await prisma.movimientoHerramienta.findUnique({
      where: {
        ordenTrabajoId_herramientaId: {
          ordenTrabajoId: parseInt(ordenTrabajoId),
          herramientaId: parseInt(herramientaId)
        }
      }
    });

    if (!movimientoExiste) {
      return res.status(404).json({ error: 'Movimiento de herramienta no encontrado' });
    }

    const dataToUpdate = {
      cantidad: parseInt(cantidad)
    };

    if (fecha) {
      dataToUpdate.fecha = new Date(fecha);
    }

    const movimiento = await prisma.movimientoHerramienta.update({
      where: {
        ordenTrabajoId_herramientaId: {
          ordenTrabajoId: parseInt(ordenTrabajoId),
          herramientaId: parseInt(herramientaId)
        }
      },
      data: dataToUpdate,
      include: {
        herramienta: {
          include: {
            marca: true
          }
        },
        ordenTrabajo: {
          include: {
            empleado: true,
            detalle: {
              include: {
                servicio: true
              }
            }
          }
        }
      }
    });

    // Convertir BigInt a string antes de enviar JSON
    const movimientoJSON = JSON.parse(JSON.stringify(movimiento, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(movimientoJSON);
  } catch (error) {
    console.error('Error al actualizar movimiento de herramienta:', error);
    res.status(500).json({ 
      error: 'Error al actualizar movimiento de herramienta',
      details: error.message 
    });
  }
};

// Eliminar un movimiento de herramienta
export const deleteMovimientoHerramienta = async (req, res) => {
  try {
    const { ordenTrabajoId, herramientaId } = req.params;

    // Verificar si existe el movimiento
    const movimiento = await prisma.movimientoHerramienta.findUnique({
      where: {
        ordenTrabajoId_herramientaId: {
          ordenTrabajoId: parseInt(ordenTrabajoId),
          herramientaId: parseInt(herramientaId)
        }
      }
    });

    if (!movimiento) {
      return res.status(404).json({ error: 'Movimiento de herramienta no encontrado' });
    }

    await prisma.movimientoHerramienta.delete({
      where: {
        ordenTrabajoId_herramientaId: {
          ordenTrabajoId: parseInt(ordenTrabajoId),
          herramientaId: parseInt(herramientaId)
        }
      }
    });

    res.json({ message: 'Movimiento de herramienta eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar movimiento de herramienta:', error);
    res.status(500).json({ 
      error: 'Error al eliminar movimiento de herramienta',
      details: error.message 
    });
  }
};
