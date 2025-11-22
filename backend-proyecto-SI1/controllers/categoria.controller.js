import prisma from '../config/database.js';

// Obtener todas las categorías
export const getAllCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json({
      categorias,
      total: categorias.length
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ 
      error: 'Error al obtener categorías',
      details: error.message 
    });
  }
};

// Obtener categoría por ID
export const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) },
      include: {
        servicios: true
      }
    });

    if (!categoria) {
      return res.status(404).json({ 
        error: 'Categoría no encontrada' 
      });
    }

    res.json(categoria);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ 
      error: 'Error al obtener categoría',
      details: error.message 
    });
  }
};

// Crear categoría
export const createCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ 
        error: 'El nombre es requerido' 
      });
    }

    if (nombre.length > 80) {
      return res.status(400).json({ 
        error: 'El nombre no puede exceder 80 caracteres' 
      });
    }

    // Verificar si ya existe una categoría con ese nombre
    const categoriaExistente = await prisma.categoria.findFirst({
      where: { 
        nombre: {
          equals: nombre,
          mode: 'insensitive'
        }
      }
    });

    if (categoriaExistente) {
      return res.status(400).json({ 
        error: 'Ya existe una categoría con ese nombre' 
      });
    }

    const nuevaCategoria = await prisma.categoria.create({
      data: { nombre }
    });

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      categoria: nuevaCategoria
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ 
      error: 'Error al crear categoría',
      details: error.message 
    });
  }
};
