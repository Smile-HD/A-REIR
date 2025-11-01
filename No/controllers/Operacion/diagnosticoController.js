require("dotenv").config();
const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();
const Validaciones = require("../../utils/validaciones");
const { bitacora } = require("../../utils/bitacora");

// Helpers
const parseDateOnly = (value) => {
  if (value instanceof Date) return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) throw new Error("Fecha inválida");
  return d;
};

const parseTimeToDate = (timeStr) => {
  // Returns a Date object with today's date and given time
  const pattern = /^\d{2}:\d{2}(:\d{2})?$/;
  if (typeof timeStr !== "string" || !pattern.test(timeStr)) {
    throw new Error("Formato de hora inválido HH:MM o HH:MM:SS");
  }
  const [hh, mm, ss] = timeStr.split(":");
  const base = new Date();
  base.setHours(parseInt(hh, 10), parseInt(mm, 10), ss ? parseInt(ss, 10) : 0, 0);
  return base;
};

const normalizePlaca = (placa) => placa.trim().toUpperCase();

const resolveUsuarioId = async (req) => {
  if (!req.user) return null;
  if (req.user.usuario) {
    const u = await prisma.usuario.findUnique({
      where: { usuario: req.user.usuario },
      select: { id: true }
    });
    return u?.id ?? null;
  }
  return req.user.id ?? null;
};

const buildOrderBy = (sortBy, sortOrder) => {
  const order = sortOrder === "desc" ? "desc" : "asc";
  switch (sortBy) {
    case "fecha":
      return { fecha: order };
    case "hora":
      return { hora: order };
    case "placa_moto":
      return { placa_moto: order };
    default:
      return { fecha: "desc" };
  }
};
// --- Nuevo helper: convierte BigInt a string recursivamente ---

const convertBigIntToString = (value) => {
  if (value === null || value === undefined) return value;

  // BigInt -> string (más seguro que Number para ids grandes)
  if (typeof value === "bigint") return value.toString();

  // Date -> ISO string (evita que quede como {})
  if (value instanceof Date) return value.toISOString();

  // Arrays -> map recursivo
  if (Array.isArray(value)) return value.map(convertBigIntToString);

  // Objetos planos -> convertir cada campo recursivamente
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = convertBigIntToString(v);
    }
    return out;
  }

  // primitivos (string, number, boolean)
  return value;
};
// --- fin helper ---

// CREATE Diagnóstico con detalles opcionales
const createDiagnostico = async (req, res) => {
  const { fecha, hora, placa_moto, empleado_ci, detalles = [] } = req.body;
  try {
    // Validaciones
    Validaciones.fechaDiagnostico(fecha);
    Validaciones.horaDiagnostico(hora);
    Validaciones.placa(placa_moto);
    Validaciones.empleado_ci(empleado_ci);

    // Normalizaciones y parseo
    const fechaDate = parseDateOnly(fecha);
    const horaDate = parseTimeToDate(hora);
    const placa = normalizePlaca(placa_moto);
    const empleadoCi = Number(empleado_ci);

    // Verificar existencia de moto y empleado
    const [moto, empleado] = await Promise.all([
      prisma.moto.findUnique({ where: { placa } }),
      prisma.empleado.findUnique({ where: { ci: empleadoCi } })
    ]);
    if (!moto) return res.status(404).json({ error: "Moto no encontrada" });
    if (!empleado) return res.status(404).json({ error: "Empleado no encontrado" });

    // Enforce unique constraint (placa_moto, fecha, hora)
    const existing = await prisma.diagnostico.findFirst({
      where: { placa_moto: placa, fecha: fechaDate, hora: horaDate }
    });
    if (existing) return res.status(409).json({ error: "Ya existe un diagnóstico para esa moto en ese momento" });

    // Validar detalles
    const detallesData = (Array.isArray(detalles) ? detalles : []).map((d) => {
      Validaciones.descripcionDiagnostico(d.descripcion);
      return { descripcion: d.descripcion };
    });

    const diag = await prisma.diagnostico.create({
      data: {
        fecha: fechaDate,
        hora: horaDate,
        placa_moto: placa,
        empleado_ci: empleadoCi,
        detalle_diagnostico: {
          create: detallesData
        }
      },
      include: {
        detalle_diagnostico: true,
        empleado: { select: { ci: true, nombre: true } },
        moto: { select: { placa: true, modelo: true } }
      }
    });

    const usuario_id = await resolveUsuarioId(req);
    await bitacora({ req, res, descripcion: `Creación de diagnóstico #${diag.nro} para ${placa}`, usuario_id });

    res.status(201).json({ message: "Diagnóstico creado", diagnostico: convertBigIntToString(diag) });
  } catch (error) {
    console.error("Error creando diagnóstico:", error);
    res.status(400).json({ error: error.message || "Error al crear diagnóstico" });
  }
};

// LIST paginado
const getAllDiagnosticos = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || "fecha";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ error: "Parámetros de paginación inválidos" });
    }

    const skip = (page - 1) * limit;
    const orderBy = buildOrderBy(sortBy, sortOrder);

    const total = await prisma.diagnostico.count();
    const items = await prisma.diagnostico.findMany({
      skip,
      take: limit,
      orderBy,
      include: {
        empleado: { select: { ci: true, nombre: true } },
        moto: { select: { placa: true, modelo: true } },
        detalle_diagnostico: true
      }
    });

    res.status(200).json({
      message: "Diagnósticos obtenidos",
      diagnosticos: items.map(convertBigIntToString),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDiagnosticos: total,
        limit
      }
    });
  } catch (error) {
    console.error("Error listando diagnósticos:", error);
    res.status(500).json({ error: error.message || "Error al obtener diagnósticos" });
  }
};

// GET by id
const getDiagnosticoById = async (req, res) => {
  const { id } = req.params;
  try {
    const nro = BigInt(id);
    const d = await prisma.diagnostico.findUnique({
      where: { nro },
      include: {
        detalle_diagnostico: true,
        empleado: { select: { ci: true, nombre: true } },
        moto: { select: { placa: true, modelo: true } },
        proforma: { select: { id: true, fecha: true, estado: true } }
      }
    });
    if (!d) return res.status(404).json({ error: "Diagnóstico no encontrado" });

    res.status(200).json({ message: "Diagnóstico encontrado", diagnostico: convertBigIntToString(d) });
  } catch (error) {
    console.error("Error obteniendo diagnóstico:", error);
    res.status(500).json({ error: error.message || "Error al obtener diagnóstico" });
  }
};

// UPDATE básico: fecha, hora, empleado_ci, placa_moto y REEMPLAZO de detalles
const updateDiagnostico = async (req, res) => {
  const { id } = req.params;
  const { fecha, hora, placa_moto, empleado_ci, detalles } = req.body;
  try {
    const nro = BigInt(id);
    const existente = await prisma.diagnostico.findUnique({ where: { nro } });
    if (!existente) return res.status(404).json({ error: "Diagnóstico no encontrado" });

    const updateData = {};

    if (fecha !== undefined) {
      Validaciones.fechaDiagnostico(fecha);
      updateData.fecha = parseDateOnly(fecha);
    }
    if (hora !== undefined) {
      Validaciones.horaDiagnostico(hora);
      updateData.hora = parseTimeToDate(hora);
    }
    if (placa_moto !== undefined) {
      Validaciones.placa(placa_moto);
      const placa = normalizePlaca(placa_moto);
      const moto = await prisma.moto.findUnique({ where: { placa } });
      if (!moto) return res.status(404).json({ error: "Moto no encontrada" });
      updateData.placa_moto = placa;
    }
    if (empleado_ci !== undefined) {
      Validaciones.empleado_ci(empleado_ci);
      const empleado = await prisma.empleado.findUnique({ where: { ci: Number(empleado_ci) } });
      if (!empleado) return res.status(404).json({ error: "Empleado no encontrado" });
      updateData.empleado_ci = Number(empleado_ci);
    }

    // Checar unicidad si se cambia fecha/hora/placa
    if (updateData.fecha || updateData.hora || updateData.placa_moto) {
      const placa = updateData.placa_moto ?? existente.placa_moto;
      const fechaDate = updateData.fecha ?? existente.fecha;
      const horaDate = updateData.hora ?? existente.hora;
      const dup = await prisma.diagnostico.findFirst({
        where: {
          nro: { not: nro },
          placa_moto: placa,
          fecha: fechaDate,
          hora: horaDate
        }
      });
      if (dup) return res.status(409).json({ error: "Ya existe un diagnóstico para esa moto en ese momento" });
    }

    // Reemplazo de detalles si se envía
    let transacciones = [];
    if (Array.isArray(detalles)) {
      const nuevos = detalles.map((d) => {
        Validaciones.descripcionDiagnostico(d.descripcion);
        return { descripcion: d.descripcion };
      });
      transacciones.push(
        prisma.detalle_diagnostico.deleteMany({ where: { diagnostico_id: nro } })
      );
      transacciones.push(
        prisma.detalle_diagnostico.createMany({ data: nuevos.map((d) => ({ ...d, diagnostico_id: nro })) })
      );
    }

    const updated = await prisma.$transaction([
      prisma.diagnostico.update({ where: { nro }, data: updateData }),
      ...transacciones
    ]);

    const result = await prisma.diagnostico.findUnique({
      where: { nro },
      include: {
        detalle_diagnostico: true,
        empleado: { select: { ci: true, nombre: true } },
        moto: { select: { placa: true, modelo: true } }
      }
    });

    const usuario_id = await resolveUsuarioId(req);
    await bitacora({ req, res, descripcion: `Actualización de diagnóstico #${id}`, usuario_id });

    res.status(200).json({ message: "Diagnóstico actualizado", diagnostico: convertBigIntToString(result) });
  } catch (error) {
    console.error("Error actualizando diagnóstico:", error);
    res.status(400).json({ error: error.message || "Error al actualizar diagnóstico" });
  }
};

// DELETE
const deleteDiagnostico = async (req, res) => {
  const { id } = req.params;
  try {
    const nro = BigInt(id);
    const existente = await prisma.diagnostico.findUnique({ where: { nro } });
    if (!existente) return res.status(404).json({ error: "Diagnóstico no encontrado" });

    // Si está ligado a proforma, impedir borrado
    const conProforma = await prisma.proforma.findFirst({ where: { diagnostico_id: nro } });
    if (conProforma) return res.status(400).json({ error: "No se puede eliminar: diagnóstico con proforma asociada" });

    await prisma.diagnostico.delete({ where: { nro } });

    const usuario_id = await resolveUsuarioId(req);
    await bitacora({ req, res, descripcion: `Eliminación de diagnóstico #${id}` , usuario_id });

    res.status(200).json({ message: "Diagnóstico eliminado" });
  } catch (error) {
    console.error("Error eliminando diagnóstico:", error);
    res.status(500).json({ error: error.message || "Error al eliminar diagnóstico" });
  }
};

// SEARCH with q (placa/modelo/empleado nombre) + optional date range
const searchDiagnosticos = async (req, res) => {
  const { q, page = 1, limit = 10, sortBy = "fecha", sortOrder = "desc", fechaInicio, fechaFin } = req.query;
  try {
    if (!q && !fechaInicio && !fechaFin) {
      return res.status(400).json({ error: "Debe enviar 'q' o rango de fechas" });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ error: "Parámetros de paginación inválidos" });
    }

    const orderBy = buildOrderBy(sortBy, sortOrder);
    const skip = (pageNum - 1) * limitNum;

    const yearNum = q && !isNaN(Number(q)) ? Number(q) : null;
    const where = {
      AND: [
        q ? {
          OR: [
            { placa_moto: { contains: q, mode: "insensitive" } },
            { moto: { modelo: { contains: q, mode: "insensitive" } } },
            { empleado: { nombre: { contains: q, mode: "insensitive" } } }
          ]
        } : {},
        fechaInicio ? { fecha: { gte: parseDateOnly(fechaInicio) } } : {},
        fechaFin ? { fecha: { lte: parseDateOnly(fechaFin) } } : {}
      ]
    };

    const total = await prisma.diagnostico.count({ where });
    const items = await prisma.diagnostico.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
      include: {
        empleado: { select: { ci: true, nombre: true } },
        moto: { select: { placa: true, modelo: true } },
        detalle_diagnostico: true
      }
    });

    res.status(200).json({
      message: `Búsqueda completada. ${total} diagnóstico(s) encontrado(s)`,
      diagnosticos: items.map(convertBigIntToString),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error("Error buscando diagnósticos:", error);
    res.status(500).json({ error: error.message || "Error en la búsqueda" });
  }
};

// Detalles: agregar y eliminar puntuales
const addDetalle = async (req, res) => {
  const { id } = req.params; // diagnostico id
  const { descripcion } = req.body;
  try {
    const nro = BigInt(id);
    const diag = await prisma.diagnostico.findUnique({ where: { nro } });
    if (!diag) return res.status(404).json({ error: "Diagnóstico no encontrado" });

    Validaciones.descripcionDiagnostico(descripcion);

    const nuevo = await prisma.detalle_diagnostico.create({
      data: {
        diagnostico_id: nro,
        descripcion
      }
    });

    res.status(201).json({ message: "Detalle agregado", detalle: convertBigIntToString(nuevo) });
  } catch (error) {
    console.error("Error agregando detalle:", error);
    res.status(400).json({ error: error.message || "Error al agregar detalle" });
  }
};

const deleteDetalle = async (req, res) => {
  const { id, detalleId } = req.params; // diagnostico id y detalle id
  try {
    const nro = BigInt(id);
    const detId = BigInt(detalleId);

    const detalle = await prisma.detalle_diagnostico.findUnique({ where: { id_diagnostico_id: { id: detId, diagnostico_id: nro } } });
    if (!detalle) return res.status(404).json({ error: "Detalle no encontrado" });

    await prisma.detalle_diagnostico.delete({ where: { id_diagnostico_id: { id: detId, diagnostico_id: nro } } });

    res.status(200).json({ message: "Detalle eliminado" });
  } catch (error) {
    console.error("Error eliminando detalle:", error);
    res.status(400).json({ error: error.message || "Error al eliminar detalle" });
  }
};

module.exports = {
  createDiagnostico,
  getAllDiagnosticos,
  getDiagnosticoById,
  updateDiagnostico,
  deleteDiagnostico,
  searchDiagnosticos,
  addDetalle,
  deleteDetalle
};
