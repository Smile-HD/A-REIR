import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todas las herramientas
export const getAllHerramientas = async (req, res) => {
  try {
    const herramientas = await prisma.herramienta.findMany({
      include: {
        marca: true,
        _count: {
          select: { movimientos: true }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json(herramientas);
  } catch (error) {
    console.error('Error al obtener herramientas:', error);
    res.status(500).json({ 
      error: 'Error al obtener herramientas',
      details: error.message 
    });
  }
};

// Obtener una herramienta por ID
export const getHerramientaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const herramienta = await prisma.herramienta.findUnique({
      where: { id: parseInt(id) },
      include: {
        marca: true,
        movimientos: {
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
        },
        _count: {
          select: { movimientos: true }
        }
      }
    });

    if (!herramienta) {
      return res.status(404).json({ error: 'Herramienta no encontrada' });
    }

    res.json(herramienta);
  } catch (error) {
    console.error('Error al obtener herramienta:', error);
    res.status(500).json({ 
      error: 'Error al obtener herramienta',
      details: error.message 
    });
  }
};

// Obtener herramientas por marca
export const getHerramientasByMarca = async (req, res) => {
  try {
    const { marcaId } = req.params;
    
    const herramientas = await prisma.herramienta.findMany({
      where: { marcaId: parseInt(marcaId) },
      include: {
        marca: true,
        _count: {
          select: { movimientos: true }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json(herramientas);
  } catch (error) {
    console.error('Error al obtener herramientas por marca:', error);
    res.status(500).json({ 
      error: 'Error al obtener herramientas por marca',
      details: error.message 
    });
  }
};

// Crear una nueva herramienta
export const createHerramienta = async (req, res) => {
  try {
    const { nombre, descripcion, marcaId } = req.body;

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la herramienta es obligatorio' });
    }

    if (!marcaId) {
      return res.status(400).json({ error: 'La marca es obligatoria' });
    }

    // Verificar que la marca existe
    const marcaExiste = await prisma.marcaHerramienta.findUnique({
      where: { id: parseInt(marcaId) }
    });

    if (!marcaExiste) {
      return res.status(404).json({ error: 'La marca especificada no existe' });
    }

    // Verificar si ya existe una herramienta con ese nombre en la misma marca
    const herramientaExistente = await prisma.herramienta.findFirst({
      where: {
        AND: [
          {
            nombre: {
              equals: nombre.trim(),
              mode: 'insensitive'
            }
          },
          { marcaId: parseInt(marcaId) }
        ]
      }
    });

    if (herramientaExistente) {
      return res.status(400).json({ error: 'Ya existe una herramienta con ese nombre en esta marca' });
    }

    const herramienta = await prisma.herramienta.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        marcaId: parseInt(marcaId)
      },
      include: {
        marca: true,
        _count: {
          select: { movimientos: true }
        }
      }
    });

    res.status(201).json(herramienta);
  } catch (error) {
    console.error('Error al crear herramienta:', error);

    // Manejar error de constraint único de Prisma (P2002)
    if (error.code === 'P2002' && error.meta && error.meta.modelName === 'Herramienta') {
      // Intentar sincronizar la secuencia de PostgreSQL y reintentar la inserción una vez
      try {
        console.warn('P2002 detectado en Herramienta. Intentando corregir secuencia y reintentar...');
        // Ejecutar setval usando pg_get_serial_sequence para evitar necesidad de conocer el nombre exacto
        await prisma.$queryRawUnsafe(`SELECT setval(pg_get_serial_sequence('"HERRAMIENTA"','ID'), (SELECT COALESCE(MAX("ID"),0) FROM "HERRAMIENTA"));`);

        // Reintentar crear la herramienta usando los mismos datos del body
        const { nombre: _nombre, descripcion: _descripcion, marcaId: _marcaId } = req.body;
        const herramientaRetry = await prisma.herramienta.create({
          data: {
            nombre: _nombre.trim(),
            descripcion: _descripcion?.trim() || null,
            marcaId: parseInt(_marcaId)
          },
          include: {
            marca: true,
            _count: { select: { movimientos: true } }
          }
        });

        console.info('Reintento de creación de herramienta exitoso después de sincronizar la secuencia');
        return res.status(201).json(herramientaRetry);
      } catch (retryError) {
        console.error('Reintento tras sincronizar secuencia falló:', retryError);
        return res.status(409).json({
          error: 'Violación de restricción única al crear la herramienta (intentado reparar secuencia)',
          details: retryError.message,
          hint: 'Si el problema persiste, sincronice manualmente la secuencia en PostgreSQL: SELECT setval(pg_get_serial_sequence(\'"HERRAMIENTA"\',\'ID\'), (SELECT COALESCE(MAX("ID"),0) FROM "HERRAMIENTA"));'
        });
      }
    }

    res.status(500).json({ 
      error: 'Error al crear herramienta',
      details: error.message 
    });
  }
};

// Actualizar una herramienta
export const updateHerramienta = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, marcaId } = req.body;

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la herramienta es obligatorio' });
    }

    if (!marcaId) {
      return res.status(400).json({ error: 'La marca es obligatoria' });
    }

    // Verificar si existe la herramienta
    const herramientaExiste = await prisma.herramienta.findUnique({
      where: { id: parseInt(id) }
    });

    if (!herramientaExiste) {
      return res.status(404).json({ error: 'Herramienta no encontrada' });
    }

    // Verificar que la marca existe
    const marcaExiste = await prisma.marcaHerramienta.findUnique({
      where: { id: parseInt(marcaId) }
    });

    if (!marcaExiste) {
      return res.status(404).json({ error: 'La marca especificada no existe' });
    }

    // Verificar si ya existe otra herramienta con ese nombre en la misma marca
    const herramientaDuplicada = await prisma.herramienta.findFirst({
      where: {
        AND: [
          { id: { not: parseInt(id) } },
          {
            nombre: {
              equals: nombre.trim(),
              mode: 'insensitive'
            }
          },
          { marcaId: parseInt(marcaId) }
        ]
      }
    });

    if (herramientaDuplicada) {
      return res.status(400).json({ error: 'Ya existe otra herramienta con ese nombre en esta marca' });
    }

    const herramienta = await prisma.herramienta.update({
      where: { id: parseInt(id) },
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        marcaId: parseInt(marcaId)
      },
      include: {
        marca: true,
        _count: {
          select: { movimientos: true }
        }
      }
    });

    res.json(herramienta);
  } catch (error) {
    console.error('Error al actualizar herramienta:', error);
    res.status(500).json({ 
      error: 'Error al actualizar herramienta',
      details: error.message 
    });
  }
};

// Eliminar una herramienta
export const deleteHerramienta = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si existe la herramienta
    const herramienta = await prisma.herramienta.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { movimientos: true }
        }
      }
    });

    if (!herramienta) {
      return res.status(404).json({ error: 'Herramienta no encontrada' });
    }

    // Verificar si tiene movimientos asociados
    if (herramienta._count.movimientos > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar la herramienta porque tiene ${herramienta._count.movimientos} movimiento(s) registrado(s)` 
      });
    }

    await prisma.herramienta.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Herramienta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar herramienta:', error);
    res.status(500).json({ 
      error: 'Error al eliminar herramienta',
      details: error.message 
    });
  }
};
