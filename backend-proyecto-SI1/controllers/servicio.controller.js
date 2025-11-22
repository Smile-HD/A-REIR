import prisma from '../config/database.js';

// Obtener todos los servicios
export const getAllServicios = async (req, res) => {
  try {
    const servicios = await prisma.servicio.findMany({
      include: {
        categoria: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    res.json({
      servicios,
      total: servicios.length
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ 
      error: 'Error al obtener servicios',
      details: error.message 
    });
  }
};

// Obtener servicio por ID
export const getServicioById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const servicio = await prisma.servicio.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: true
      }
    });

    if (!servicio) {
      return res.status(404).json({ 
        error: 'Servicio no encontrado' 
      });
    }

    res.json(servicio);
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({ 
      error: 'Error al obtener servicio',
      details: error.message 
    });
  }
};

// Crear servicio
export const createServicio = async (req, res) => {
  try {
    const { descripcion, categoriaId, categoriaNombre } = req.body;

    // Validaciones
    if (!descripcion) {
      return res.status(400).json({ 
        error: 'La descripción es requerida' 
      });
    }

    if (descripcion.length > 200) {
      return res.status(400).json({ 
        error: 'La descripción no puede exceder 200 caracteres' 
      });
    }

    // Determinar el ID de la categoría
    let finalCategoriaId = categoriaId;

    // Si se proporciona un nombre de categoría nueva, crearla
    if (categoriaNombre && !categoriaId) {
      // Validar longitud del nombre de categoría
      if (categoriaNombre.length > 80) {
        return res.status(400).json({ 
          error: 'El nombre de la categoría no puede exceder 80 caracteres' 
        });
      }

      // Verificar si ya existe una categoría con ese nombre
      const categoriaExistente = await prisma.categoria.findFirst({
        where: { 
          nombre: {
            equals: categoriaNombre,
            mode: 'insensitive'
          }
        }
      });

      if (categoriaExistente) {
        finalCategoriaId = categoriaExistente.id;
      } else {
        const nuevaCategoria = await prisma.categoria.create({
          data: { nombre: categoriaNombre }
        });
        finalCategoriaId = nuevaCategoria.id;
      }
    } else if (!categoriaId) {
      return res.status(400).json({ 
        error: 'Debe proporcionar una categoría existente o crear una nueva' 
      });
    }

    const nuevoServicio = await prisma.servicio.create({
      data: {
        descripcion,
        categoriaId: parseInt(finalCategoriaId)
      },
      include: {
        categoria: true
      }
    });

    res.status(201).json({
      message: 'Servicio creado exitosamente',
      servicio: nuevoServicio
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ 
      error: 'Error al crear servicio',
      details: error.message 
    });
  }
};

// Actualizar servicio
export const updateServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, categoriaId, categoriaNombre } = req.body;

    // Validar que el servicio exista
    const servicioExistente = await prisma.servicio.findUnique({
      where: { id: parseInt(id) }
    });

    if (!servicioExistente) {
      return res.status(404).json({ 
        error: 'Servicio no encontrado' 
      });
    }

    // Validar descripción si se proporciona
    if (descripcion && descripcion.length > 200) {
      return res.status(400).json({ 
        error: 'La descripción no puede exceder 200 caracteres' 
      });
    }

    // Determinar el ID de la categoría
    let finalCategoriaId = servicioExistente.categoriaId;

    if (categoriaId) {
      finalCategoriaId = parseInt(categoriaId);
    } else if (categoriaNombre) {
      // Validar longitud del nombre de categoría
      if (categoriaNombre.length > 80) {
        return res.status(400).json({ 
          error: 'El nombre de la categoría no puede exceder 80 caracteres' 
        });
      }

      // Verificar si ya existe una categoría con ese nombre
      const categoriaExistente = await prisma.categoria.findFirst({
        where: { 
          nombre: {
            equals: categoriaNombre,
            mode: 'insensitive'
          }
        }
      });

      if (categoriaExistente) {
        finalCategoriaId = categoriaExistente.id;
      } else {
        const nuevaCategoria = await prisma.categoria.create({
          data: { nombre: categoriaNombre }
        });
        finalCategoriaId = nuevaCategoria.id;
      }
    }

    const servicioActualizado = await prisma.servicio.update({
      where: { id: parseInt(id) },
      data: {
        descripcion: descripcion || servicioExistente.descripcion,
        categoriaId: finalCategoriaId
      },
      include: {
        categoria: true
      }
    });

    res.json({
      message: 'Servicio actualizado exitosamente',
      servicio: servicioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({ 
      error: 'Error al actualizar servicio',
      details: error.message 
    });
  }
};

// Eliminar servicio
export const deleteServicio = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el servicio existe
    const servicio = await prisma.servicio.findUnique({
      where: { id: parseInt(id) }
    });

    if (!servicio) {
      return res.status(404).json({ 
        error: 'Servicio no encontrado' 
      });
    }

    // Eliminar el servicio
    await prisma.servicio.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Servicio eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    
    // Error específico si hay restricciones de clave foránea
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: 'No se puede eliminar el servicio porque está siendo utilizado' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error al eliminar servicio',
      details: error.message 
    });
  }
};
