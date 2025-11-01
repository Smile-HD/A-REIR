require("dotenv").config();
const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();
const Validaciones = require("../../utils/validaciones");
const { bitacora } = require("../../utils/bitacora");

const resolveUsuarioId = async (req) => {
  if (!req.user) {
    return null;
  }

  if (req.user.usuario) {
    const user = await prisma.usuario.findUnique({
      where: { usuario: req.user.usuario },
      select: { id: true }
    });
    return user ? user.id : null;
  }

  if (req.user.id) {
    return req.user.id;
  }

  return null;
};

const normalizePlaca = (placa) => placa.trim().toUpperCase();
const normalizeChasis = (chasis) =>
  chasis === undefined || chasis === null || chasis === ""
    ? null
    : chasis.trim().toUpperCase();

const buildOrderBy = (sortBy, sortOrder) => {
  const order = sortOrder === "desc" ? "desc" : "asc";

  switch (sortBy) {
    case "modelo":
      return { modelo: order };
    case "year":
      return { year: order };
    case "marca":
      return { marca_moto: { nombre: order } };
    case "placa":
    default:
      return { placa: order };
  }
};

// CREATE - Crear moto
const createMoto = async (req, res) => {
  const { placa, modelo, year, chasis, marca_id } = req.body;

  try {
    Validaciones.placa(placa);
    Validaciones.modeloMoto(modelo);
    Validaciones.anioMoto(year);
    Validaciones.chasisMoto(chasis);
    Validaciones.marcaId(marca_id);

    const normalizedPlaca = normalizePlaca(placa);
    const normalizedModelo = modelo.trim();
    const yearNumber = Number(year);
    const marcaIdNumber = Number(marca_id);
    const normalizedChasis = normalizeChasis(chasis);

    const existingMoto = await prisma.moto.findUnique({
      where: { placa: normalizedPlaca }
    });

    if (existingMoto) {
      return res.status(409).json({ error: "Moto ya existe" });
    }

    if (normalizedChasis) {
      const existingChasis = await prisma.moto.findUnique({
        where: { chasis: normalizedChasis }
      });

      if (existingChasis) {
        return res.status(409).json({ error: "El chasis ya está registrado en otra moto" });
      }
    }

    const marca = await prisma.marca_moto.findUnique({
      where: { id: marcaIdNumber }
    });

    if (!marca) {
      return res.status(404).json({ error: "Marca de moto no encontrada" });
    }

    const nuevaMoto = await prisma.moto.create({
      data: {
        placa: normalizedPlaca,
        modelo: normalizedModelo,
        year: yearNumber,
        chasis: normalizedChasis,
        marca_id: marcaIdNumber
      },
      include: {
        marca_moto: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    const usuarioId = await resolveUsuarioId(req);
    await bitacora({
      req,
      res,
      descripcion: `Creación de moto ${normalizedPlaca} - ${normalizedModelo}`,
      usuario_id: usuarioId
    });

    res.status(201).json({
      message: "Moto creada exitosamente",
      moto: nuevaMoto
    });
  } catch (error) {
    console.error("Error al crear moto:", error);
    res.status(400).json({
      error: error.message || "Ocurrió un error al crear la moto"
    });
  }
};

// READ - Obtener todas las motos con paginación
const getAllMotos = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || "placa";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        error: "Parámetros de paginación inválidos. Page >= 1, Limit entre 1-100"
      });
    }

    const skip = (page - 1) * limit;
    const orderBy = buildOrderBy(sortBy, sortOrder);

    const totalMotos = await prisma.moto.count();

    const motos = await prisma.moto.findMany({
      skip,
      take: limit,
      orderBy,
      include: {
        marca_moto: {
          select: { id: true, nombre: true }
        }
      }
    });

    const totalPages = Math.ceil(totalMotos / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      message: "Motos obtenidas exitosamente",
      motos,
      pagination: {
        currentPage: page,
        totalPages,
        totalMotos,
        limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    });
  } catch (error) {
    console.error("Error al obtener motos:", error);
    res.status(500).json({
      error: error.message || "Ocurrió un error al obtener las motos"
    });
  }
};

// READ - Obtener moto por placa
const getMotoByPlaca = async (req, res) => {
  const { placa } = req.params;

  try {
    Validaciones.placa(placa);
    const normalizedPlaca = normalizePlaca(placa);

    const moto = await prisma.moto.findUnique({
      where: { placa: normalizedPlaca },
      include: {
        marca_moto: {
          select: { id: true, nombre: true }
        }
      }
    });

    if (!moto) {
      return res.status(404).json({ error: "Moto no encontrada" });
    }

    res.status(200).json({
      message: "Moto encontrada",
      moto
    });
  } catch (error) {
    console.error("Error al obtener moto:", error);
    res.status(500).json({
      error: error.message || "Ocurrió un error al obtener la moto"
    });
  }
};

// UPDATE - Actualizar moto
const updateMoto = async (req, res) => {
  const { placa } = req.params;
  const { modelo, year, chasis, marca_id } = req.body;

  try {
    Validaciones.placa(placa);
    const normalizedPlaca = normalizePlaca(placa);

    const motoExistente = await prisma.moto.findUnique({
      where: { placa: normalizedPlaca }
    });

    if (!motoExistente) {
      return res.status(404).json({ error: "Moto no encontrada" });
    }

    const updateData = {};

    if (modelo !== undefined) {
      Validaciones.modeloMoto(modelo);
      updateData.modelo = modelo.trim();
    }

    if (year !== undefined) {
      Validaciones.anioMoto(year);
      updateData.year = Number(year);
    }

    if (chasis !== undefined) {
      if (chasis === null || chasis === "") {
        updateData.chasis = null;
      } else {
        Validaciones.chasisMoto(chasis);
        const normalizedChasis = normalizeChasis(chasis);

        const existingChasis = await prisma.moto.findUnique({
          where: { chasis: normalizedChasis }
        });

        if (existingChasis && existingChasis.placa !== normalizedPlaca) {
          return res.status(409).json({ error: "El chasis ya está registrado en otra moto" });
        }

        updateData.chasis = normalizedChasis;
      }
    }

    if (marca_id !== undefined) {
      Validaciones.marcaId(marca_id);
      const marcaIdNumber = Number(marca_id);

      const marca = await prisma.marca_moto.findUnique({
        where: { id: marcaIdNumber }
      });

      if (!marca) {
        return res.status(404).json({ error: "Marca de moto no encontrada" });
      }

      updateData.marca_id = marcaIdNumber;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No hay datos para actualizar" });
    }

    const motoActualizada = await prisma.moto.update({
      where: { placa: normalizedPlaca },
      data: updateData,
      include: {
        marca_moto: {
          select: { id: true, nombre: true }
        }
      }
    });

    const usuarioId = await resolveUsuarioId(req);
    await bitacora({
      req,
      res,
      descripcion: `Actualización de moto ${normalizedPlaca}`,
      usuario_id: usuarioId
    });

    res.status(200).json({
      message: "Moto actualizada exitosamente",
      moto: motoActualizada
    });
  } catch (error) {
    console.error("Error al actualizar moto:", error);
    res.status(400).json({
      error: error.message || "Ocurrió un error al actualizar la moto"
    });
  }
};

// DELETE - Eliminar moto
const deleteMoto = async (req, res) => {
  const { placa } = req.params;

  try {
    Validaciones.placa(placa);
    const normalizedPlaca = normalizePlaca(placa);

    const motoExistente = await prisma.moto.findUnique({
      where: { placa: normalizedPlaca },
      include: {
        diagnostico: true,
        marca_moto: {
          select: { id: true, nombre: true }
        }
      }
    });

    if (!motoExistente) {
      return res.status(404).json({ error: "Moto no encontrada" });
    }

    if (motoExistente.diagnostico.length > 0) {
      return res.status(400).json({
        error: "No se puede eliminar la moto porque tiene diagnósticos asociados",
        details: {
          diagnosticos: motoExistente.diagnostico.length
        }
      });
    }

    await prisma.moto.delete({
      where: { placa: normalizedPlaca }
    });

    const usuarioId = await resolveUsuarioId(req);
    await bitacora({
      req,
      res,
      descripcion: `Eliminación de moto ${normalizedPlaca}`,
      usuario_id: usuarioId
    });

    res.status(200).json({
      message: "Moto eliminada exitosamente",
      moto: motoExistente
    });
  } catch (error) {
    console.error("Error al eliminar moto:", error);
    res.status(500).json({
      error: error.message || "Ocurrió un error al eliminar la moto"
    });
  }
};

// SEARCH - Buscar motos con paginación
const searchMotos = async (req, res) => {
  const { q, page = 1, limit = 10, sortBy = "placa", sortOrder = "asc" } = req.query;

  try {
    if (!q || q.trim() === "") {
      return res.status(400).json({ error: "Parámetro de búsqueda requerido" });
    }

    const searchTerm = q.trim();
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: "Parámetros de paginación inválidos. Page >= 1, Limit entre 1-100"
      });
    }

    const skip = (pageNum - 1) * limitNum;
    const orderBy = buildOrderBy(sortBy, sortOrder);
    const yearNumber = Number(searchTerm);

    const conditions = [
      { placa: { contains: searchTerm, mode: "insensitive" } },
      { modelo: { contains: searchTerm, mode: "insensitive" } },
      { chasis: { contains: searchTerm, mode: "insensitive" } },
      { marca_moto: { nombre: { contains: searchTerm, mode: "insensitive" } } }
    ];

    if (!Number.isNaN(yearNumber)) {
      conditions.push({ year: yearNumber });
    }

    const where = { OR: conditions };

    const totalResults = await prisma.moto.count({ where });

    const motos = await prisma.moto.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
      include: {
        marca_moto: {
          select: { id: true, nombre: true }
        }
      }
    });

    const totalPages = Math.ceil(totalResults / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      message: `Búsqueda completada. ${totalResults} moto(s) encontrada(s)`,
      motos,
      searchTerm,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalResults,
        limit: limitNum,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        prevPage: hasPrevPage ? pageNum - 1 : null
      }
    });
  } catch (error) {
    console.error("Error al buscar motos:", error);
    res.status(500).json({
      error: error.message || "Ocurrió un error al buscar las motos"
    });
  }
};

// READ - Obtener marcas de motos
const getMarcasMoto = async (req, res) => {
  try {
    const marcas = await prisma.marca_moto.findMany({
      orderBy: { nombre: "asc" }
    });

    res.status(200).json({
      message: "Marcas obtenidas exitosamente",
      marcas
    });
  } catch (error) {
    console.error("Error al obtener marcas de motos:", error);
    res.status(500).json({
      error: error.message || "Ocurrió un error al obtener las marcas"
    });
  }
};

module.exports = {
  createMoto,
  getAllMotos,
  getMotoByPlaca,
  updateMoto,
  deleteMoto,
  searchMotos,
  getMarcasMoto
};
