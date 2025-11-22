import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Obtener todas las órdenes de trabajo
const getAllOrdenesTrabajo = async (req, res) => {
  try {
    const ordenes = await prisma.ordenTrabajo.findMany({
      include: {
        empleado: {
          select: {
            ci: true,
            nombre: true,
            apellidos: true,
            telefono: true
          }
        },
        usuario: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        detalle: {
          include: {
            servicio: true,
            proforma: {
              include: {
                cliente: true,
                diagnostico: {
                  include: {
                    moto: {
                      include: {
                        marca: true
                      }
                    }
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
    const ordenesJSON = JSON.parse(JSON.stringify(ordenes, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    res.json(ordenesJSON);
  } catch (error) {
    console.error('Error al obtener órdenes de trabajo:', error);
    res.status(500).json({ error: 'Error al obtener órdenes de trabajo' });
  }
};

// Obtener una orden de trabajo por ID
const getOrdenTrabajoById = async (req, res) => {
  try {
    const { id } = req.params;
    const orden = await prisma.ordenTrabajo.findUnique({
      where: { id: parseInt(id) },
      include: {
        empleado: {
          select: {
            ci: true,
            nombre: true,
            apellidos: true,
            telefono: true
          }
        },
        usuario: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        detalle: {
          include: {
            servicio: true,
            proforma: {
              include: {
                cliente: true,
                diagnostico: {
                  include: {
                    moto: {
                      include: {
                        marca: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!orden) {
      return res.status(404).json({ error: 'Orden de trabajo no encontrada' });
    }

    // Convertir BigInt a string antes de enviar JSON
    const ordenJSON = JSON.parse(JSON.stringify(orden, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(ordenJSON);
  } catch (error) {
    console.error('Error al obtener orden de trabajo:', error);
    res.status(500).json({ error: 'Error al obtener orden de trabajo' });
  }
};

// Crear nueva orden de trabajo
const createOrdenTrabajo = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, estado, empleadoCi, usuarioId, detalleId } = req.body;

    // Validaciones
    if (!fechaInicio || !empleadoCi) {
      return res.status(400).json({ 
        error: 'La fecha de inicio y el empleado son campos obligatorios' 
      });
    }

    // Validar que la fecha de inicio no sea futura
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);

    if (inicio > hoy) {
      return res.status(400).json({ 
        error: 'La fecha de inicio no puede ser mayor a la fecha actual' 
      });
    }

    // Validar que fecha_fin >= fecha_inicio si se proporciona
    if (fechaFin) {
      const fin = new Date(fechaFin);
      if (fin < inicio) {
        return res.status(400).json({ 
          error: 'La fecha de fin no puede ser menor a la fecha de inicio' 
        });
      }
    }

    // Verificar que el empleado existe
    const empleado = await prisma.empleado.findUnique({
      where: { ci: parseInt(empleadoCi) }
    });

    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Verificar que el usuario existe si se proporciona
    if (usuarioId) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(usuarioId) }
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
    }

    // Verificar que el detalle de proforma existe si se proporciona
    if (detalleId) {
      const detalle = await prisma.detalleProforma.findUnique({
        where: { id: parseInt(detalleId) }
      });

      if (!detalle) {
        return res.status(404).json({ error: 'Detalle de proforma no encontrado' });
      }
    }

    const nuevaOrden = await prisma.ordenTrabajo.create({
      data: {
        fechaInicio: new Date(fechaInicio),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        estado: estado || 'ABIERTA',
        empleadoCi: parseInt(empleadoCi),
        usuarioId: usuarioId ? parseInt(usuarioId) : null,
        detalleId: detalleId ? parseInt(detalleId) : null
      },
      include: {
        empleado: {
          select: {
            ci: true,
            nombre: true,
            apellidos: true
          }
        },
        usuario: {
          select: {
            id: true,
            username: true
          }
        },
        detalle: {
          include: {
            servicio: true,
            proforma: {
              include: {
                cliente: true,
                diagnostico: {
                  include: {
                    moto: {
                      include: {
                        marca: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Convertir BigInt a string antes de enviar JSON
    const nuevaOrdenJSON = JSON.parse(JSON.stringify(nuevaOrden, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.status(201).json(nuevaOrdenJSON);
  } catch (error) {
    console.error('Error al crear orden de trabajo:', error);
    res.status(500).json({ error: 'Error al crear orden de trabajo' });
  }
};

// Actualizar orden de trabajo
const updateOrdenTrabajo = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaInicio, fechaFin, estado, empleadoCi, usuarioId, detalleId } = req.body;

    // Verificar que la orden existe
    const ordenExistente = await prisma.ordenTrabajo.findUnique({
      where: { id: parseInt(id) }
    });

    if (!ordenExistente) {
      return res.status(404).json({ error: 'Orden de trabajo no encontrada' });
    }

    // Validar fecha de inicio si se proporciona
    if (fechaInicio) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);

      if (inicio > hoy) {
        return res.status(400).json({ 
          error: 'La fecha de inicio no puede ser mayor a la fecha actual' 
        });
      }
    }

    // Validar fechas si ambas existen
    const inicioFinal = fechaInicio ? new Date(fechaInicio) : ordenExistente.fechaInicio;
    if (fechaFin) {
      const fin = new Date(fechaFin);
      if (fin < inicioFinal) {
        return res.status(400).json({ 
          error: 'La fecha de fin no puede ser menor a la fecha de inicio' 
        });
      }
    }

    // Verificar empleado si se proporciona
    if (empleadoCi) {
      const empleado = await prisma.empleado.findUnique({
        where: { ci: parseInt(empleadoCi) }
      });

      if (!empleado) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }
    }

    // Verificar usuario si se proporciona
    if (usuarioId) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(usuarioId) }
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
    }

    // Verificar detalle si se proporciona
    if (detalleId) {
      const detalle = await prisma.detalleProforma.findUnique({
        where: { id: parseInt(detalleId) }
      });

      if (!detalle) {
        return res.status(404).json({ error: 'Detalle de proforma no encontrado' });
      }
    }

    const dataToUpdate = {};
    if (fechaInicio !== undefined) dataToUpdate.fechaInicio = new Date(fechaInicio);
    if (fechaFin !== undefined) dataToUpdate.fechaFin = fechaFin ? new Date(fechaFin) : null;
    if (estado !== undefined) dataToUpdate.estado = estado;
    if (empleadoCi !== undefined) dataToUpdate.empleadoCi = parseInt(empleadoCi);
    if (usuarioId !== undefined) dataToUpdate.usuarioId = usuarioId ? parseInt(usuarioId) : null;
    if (detalleId !== undefined) dataToUpdate.detalleId = detalleId ? parseInt(detalleId) : null;

    const ordenActualizada = await prisma.ordenTrabajo.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      include: {
        empleado: {
          select: {
            ci: true,
            nombre: true,
            apellidos: true
          }
        },
        usuario: {
          select: {
            id: true,
            username: true
          }
        },
        detalle: {
          include: {
            servicio: true,
            proforma: {
              include: {
                cliente: true,
                diagnostico: {
                  include: {
                    moto: {
                      include: {
                        marca: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Convertir BigInt a string antes de enviar JSON
    const ordenJSON = JSON.parse(JSON.stringify(ordenActualizada, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(ordenJSON);
  } catch (error) {
    console.error('Error al actualizar orden de trabajo:', error);
    res.status(500).json({ error: 'Error al actualizar orden de trabajo' });
  }
};

// Eliminar orden de trabajo
const deleteOrdenTrabajo = async (req, res) => {
  try {
    const { id } = req.params;

    const orden = await prisma.ordenTrabajo.findUnique({
      where: { id: parseInt(id) }
    });

    if (!orden) {
      return res.status(404).json({ error: 'Orden de trabajo no encontrada' });
    }

    await prisma.ordenTrabajo.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Orden de trabajo eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar orden de trabajo:', error);
    res.status(500).json({ error: 'Error al eliminar orden de trabajo' });
  }
};

// Obtener órdenes por empleado
const getOrdenesByEmpleado = async (req, res) => {
  try {
    const { empleadoCi } = req.params;
    
    const ordenes = await prisma.ordenTrabajo.findMany({
      where: { empleadoCi: parseInt(empleadoCi) },
      include: {
        empleado: true,
        usuario: true,
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
      },
      orderBy: {
        fechaInicio: 'desc'
      }
    });

    res.json(ordenes);
  } catch (error) {
    console.error('Error al obtener órdenes por empleado:', error);
    res.status(500).json({ error: 'Error al obtener órdenes por empleado' });
  }
};

// Obtener órdenes por estado
const getOrdenesByEstado = async (req, res) => {
  try {
    const { estado } = req.params;
    
    const ordenes = await prisma.ordenTrabajo.findMany({
      where: { estado: estado },
      include: {
        empleado: true,
        usuario: true,
        detalle: {
          include: {
            servicio: true,
            proforma: true
          }
        }
      },
      orderBy: {
        fechaInicio: 'desc'
      }
    });

    res.json(ordenes);
  } catch (error) {
    console.error('Error al obtener órdenes por estado:', error);
    res.status(500).json({ error: 'Error al obtener órdenes por estado' });
  }
};

export {
  getAllOrdenesTrabajo,
  getOrdenTrabajoById,
  createOrdenTrabajo,
  updateOrdenTrabajo,
  deleteOrdenTrabajo,
  getOrdenesByEmpleado,
  getOrdenesByEstado
};
