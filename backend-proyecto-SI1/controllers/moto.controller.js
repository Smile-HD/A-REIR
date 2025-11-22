import prisma from '../config/database.js';

// Obtener todas las motos
export const getAllMotos = async (req, res) => {
  try {
    const motos = await prisma.moto.findMany({
      include: {
        marca: true
      },
      orderBy: {
        placa: 'asc'
      }
    });

    res.json({
      motos,
      total: motos.length
    });
  } catch (error) {
    console.error('Error al obtener motos:', error);
    res.status(500).json({ 
      error: 'Error al obtener motos',
      details: error.message 
    });
  }
};

// Obtener moto por placa
export const getMotoById = async (req, res) => {
  try {
    const { placa } = req.params;
    
    const moto = await prisma.moto.findUnique({
      where: { placa },
      include: {
        marca: true
      }
    });

    if (!moto) {
      return res.status(404).json({ 
        error: 'Moto no encontrada' 
      });
    }

    res.json(moto);
  } catch (error) {
    console.error('Error al obtener moto:', error);
    res.status(500).json({ 
      error: 'Error al obtener moto',
      details: error.message 
    });
  }
};

// Crear moto
export const createMoto = async (req, res) => {
  try {
    const { placa, modelo, anio, chasis, marcaId, marcaNombre } = req.body;

    // Validaciones
    if (!placa || !modelo || !anio) {
      return res.status(400).json({ 
        error: 'Placa, modelo y año son requeridos' 
      });
    }

    // Validar año
    if (anio < 1900 || anio > 2100) {
      return res.status(400).json({ 
        error: 'El año debe estar entre 1900 y 2100' 
      });
    }

    // Validar que la placa no exista
    const motoExistente = await prisma.moto.findUnique({
      where: { placa }
    });

    if (motoExistente) {
      return res.status(400).json({ 
        error: 'Ya existe una moto con esa placa' 
      });
    }

    // Si se proporciona un chasis, validar que sea único
    if (chasis) {
      const chasisExistente = await prisma.moto.findUnique({
        where: { chasis }
      });

      if (chasisExistente) {
        return res.status(400).json({ 
          error: 'Ya existe una moto con ese número de chasis' 
        });
      }
    }

    // Determinar el ID de la marca
    let finalMarcaId = marcaId;

    // Si se proporciona un nombre de marca nueva, crearla
    if (marcaNombre && !marcaId) {
      const nuevaMarca = await prisma.marcaMoto.create({
        data: { nombre: marcaNombre }
      });
      finalMarcaId = nuevaMarca.id;
    } else if (!marcaId) {
      return res.status(400).json({ 
        error: 'Debe proporcionar una marca existente o crear una nueva' 
      });
    }

    const nuevaMoto = await prisma.moto.create({
      data: {
        placa,
        modelo,
        anio: parseInt(anio),
        chasis: chasis || null,
        marcaId: parseInt(finalMarcaId)
      },
      include: {
        marca: true
      }
    });

    res.status(201).json({
      message: 'Moto creada exitosamente',
      moto: nuevaMoto
    });
  } catch (error) {
    console.error('Error al crear moto:', error);
    res.status(500).json({ 
      error: 'Error al crear moto',
      details: error.message 
    });
  }
};

// Actualizar moto
export const updateMoto = async (req, res) => {
  try {
    const { placa } = req.params;
    const { modelo, anio, chasis, marcaId, marcaNombre } = req.body;

    // Validar que la moto exista
    const motoExistente = await prisma.moto.findUnique({
      where: { placa }
    });

    if (!motoExistente) {
      return res.status(404).json({ 
        error: 'Moto no encontrada' 
      });
    }

    // Validar año si se proporciona
    if (anio && (anio < 1900 || anio > 2100)) {
      return res.status(400).json({ 
        error: 'El año debe estar entre 1900 y 2100' 
      });
    }

    // Si se proporciona un chasis diferente, validar que sea único
    if (chasis && chasis !== motoExistente.chasis) {
      const chasisExistente = await prisma.moto.findUnique({
        where: { chasis }
      });

      if (chasisExistente) {
        return res.status(400).json({ 
          error: 'Ya existe una moto con ese número de chasis' 
        });
      }
    }

    // Determinar el ID de la marca
    let finalMarcaId = marcaId || motoExistente.marcaId;

    // Si se proporciona un nombre de marca nueva, crearla
    if (marcaNombre && !marcaId) {
      const nuevaMarca = await prisma.marcaMoto.create({
        data: { nombre: marcaNombre }
      });
      finalMarcaId = nuevaMarca.id;
    }

    const motoActualizada = await prisma.moto.update({
      where: { placa },
      data: {
        modelo: modelo || motoExistente.modelo,
        anio: anio ? parseInt(anio) : motoExistente.anio,
        chasis: chasis !== undefined ? (chasis || null) : motoExistente.chasis,
        marcaId: parseInt(finalMarcaId)
      },
      include: {
        marca: true
      }
    });

    res.json({
      message: 'Moto actualizada exitosamente',
      moto: motoActualizada
    });
  } catch (error) {
    console.error('Error al actualizar moto:', error);
    res.status(500).json({ 
      error: 'Error al actualizar moto',
      details: error.message 
    });
  }
};

// Eliminar moto
export const deleteMoto = async (req, res) => {
  try {
    const { placa } = req.params;

    await prisma.moto.delete({
      where: { placa }
    });

    res.json({
      message: 'Moto eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar moto:', error);
    res.status(500).json({ 
      error: 'Error al eliminar moto',
      details: error.message 
    });
  }
};

// Obtener todas las marcas
export const getAllMarcas = async (req, res) => {
  try {
    const marcas = await prisma.marcaMoto.findMany({
      include: {
        _count: {
          select: { motos: true }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json({
      marcas,
      total: marcas.length
    });
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    res.status(500).json({ 
      error: 'Error al obtener marcas',
      details: error.message 
    });
  }
};
