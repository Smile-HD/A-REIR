const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

function parseDateOnly(value) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d)) return null;
  return d;
}

// GET /bitacora
// Query params: page, pageSize, q, from, to, usuarioId, ip, order (asc|desc)
const listLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "20"), 1), 100);
    const q = (req.query.q || "").toString().trim();
    const ip = (req.query.ip || "").toString().trim();
    const usuarioId = req.query.usuarioId ? parseInt(req.query.usuarioId) : null;
    const from = parseDateOnly(req.query.from);
    const to = parseDateOnly(req.query.to);
    const order = (req.query.order || "desc").toString().toLowerCase() === "asc" ? "asc" : "desc";

    const where = {};

    if (q) {
      where.OR = [
        { descripcion: { contains: q, mode: "insensitive" } },
        { usuario: { is: { usuario: { contains: q, mode: "insensitive" } } } },
        { usuario: { is: { email: { contains: q, mode: "insensitive" } } } },
        { usuario: { is: { empleado: { is: { nombre: { contains: q, mode: "insensitive" } } } } } },
      ];
    }

    if (ip) {
      where.ip_origen = { contains: ip, mode: "insensitive" };
    }

    if (usuarioId) {
      where.usuario_id = usuarioId;
    }

    if (from || to) {
      where.fecha_hora = {};
      if (from) where.fecha_hora.gte = from;
      if (to) {
        // Incluir día completo si solo envían fecha
        const end = new Date(to);
        if (!isNaN(end)) {
          end.setHours(23, 59, 59, 999);
          where.fecha_hora.lte = end;
        }
      }
    }

    const [total, rowsRaw] = await Promise.all([
      prisma.bitacora.count({ where }),
      prisma.bitacora.findMany({
        where,
        include: {
          usuario: { select: { id: true, usuario: true, email: true, empleado: { select: { ci: true, nombre: true } } } }
        },
        orderBy: { fecha_hora: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      })
    ]);

    // Convertir BigInt a string para JSON seguro
    const rows = rowsRaw.map(r => ({
      ...r,
      id_bitacora: r.id_bitacora != null ? r.id_bitacora.toString() : null,
    }));

    return res.json({
      data: rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error("Error listando bitácora:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// GET /bitacora/:id
const getLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const raw = await prisma.bitacora.findUnique({
      where: { id_bitacora: BigInt(id) },
      include: { usuario: { select: { id: true, usuario: true, email: true, empleado: { select: { ci: true, nombre: true } } } } }
    });
    if (!raw) return res.status(404).json({ error: "Registro no encontrado" });
    const log = { ...raw, id_bitacora: raw.id_bitacora.toString() };
    return res.json(log);
  } catch (error) {
    console.error("Error obteniendo registro de bitácora:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// DELETE /bitacora/:id
const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.bitacora.delete({ where: { id_bitacora: BigInt(id) } });
    return res.json({ message: "Registro eliminado" });
  } catch (error) {
    console.error("Error eliminando registro de bitácora:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Registro no encontrado" });
    }
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// DELETE /bitacora?before=YYYY-MM-DD
const clearLogs = async (req, res) => {
  try {
    const before = parseDateOnly(req.query.before);
    if (!before) {
      return res.status(400).json({ error: "Parámetro 'before' requerido (YYYY-MM-DD)" });
    }
    const end = new Date(before);
    end.setHours(23, 59, 59, 999);
    const result = await prisma.bitacora.deleteMany({ where: { fecha_hora: { lt: end } } });
    return res.json({ message: `Eliminados ${result.count} registros anteriores a ${end.toISOString()}` });
  } catch (error) {
    console.error("Error limpiando bitácora:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// GET /bitacora/usuarios -> para filtros
const listUsuariosConBitacora = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { bitacora: { some: {} } },
      select: { id: true, usuario: true, empleado: { select: { ci: true, nombre: true } } },
      orderBy: { usuario: "asc" }
    });
    return res.json(usuarios);
  } catch (error) {
    console.error("Error listando usuarios con bitácora:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  listLogs,
  getLogById,
  deleteLog,
  clearLogs,
  listUsuariosConBitacora,
};
