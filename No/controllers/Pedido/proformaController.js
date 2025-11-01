const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();
const Validaciones = require("../../utils/validaciones");
const { bitacora } = require("../../utils/bitacora");

function parseDateOnly(value) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d)) return null;
  return d;
}

function toDecimal(n) {
  const num = Number(n);
  if (!isFinite(num)) return 0;
  return num;
}

// Recalcular total desde detalles
async function calcularTotal(proformaId) {
  const detalles = await prisma.detalle_proforma.findMany({
    where: { proforma_id: BigInt(proformaId) },
    select: { cantidad: true, precio_unit: true }
  });
  const total = detalles.reduce((acc, d) => {
    const cantidad = Number(d.cantidad);
    const precio = Number(d.precio_unit);
    return acc + (cantidad * precio);
  }, 0);
  // Actualizar el total en proforma
  await prisma.proforma.update({
    where: { id: BigInt(proformaId) },
    data: { total }
  });
  return total;
}
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

// Crear proforma con detalles
const createProforma = async (req, res) => {
  try {
    const { fecha, cliente_ci, diagnostico_id, estado = 'PENDIENTE', detalles = [] } = req.body;

    if (!cliente_ci) return res.status(400).json({ error: 'cliente_ci es requerido' });
    if (diagnostico_id !== undefined && diagnostico_id !== null) {
      // Unique por esquema, pero validamos si ya usada
      const existe = await prisma.proforma.findUnique({ where: { diagnostico_id: BigInt(diagnostico_id) } }).catch(() => null);
      if (existe) return res.status(409).json({ error: 'Ya existe una proforma para ese diagnóstico' });
    }

    Validaciones.fechaProforma(fecha || new Date());
    Validaciones.estadoProforma(estado);

    // Verificar cliente
    const cliente = await prisma.cliente.findUnique({ where: { ci: Number(cliente_ci) } });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    // Verificar diagnostico si viene
    if (diagnostico_id) {
      const diag = await prisma.diagnostico.findUnique({ where: { nro: BigInt(diagnostico_id) } });
      if (!diag) return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }

    // Preparar detalles
    const detallesData = Array.isArray(detalles) ? detalles : [];
    for (const d of detallesData) {
      Validaciones.descripcionDetalleProforma(d.descripcion || '');
      Validaciones.cantidadProforma(d.cantidad || 0);
      Validaciones.precioUnitario(d.precio_unit || 0);
    }

    const created = await prisma.proforma.create({
      data: {
        fecha: fecha ? new Date(fecha) : new Date(),
        estado: estado.toUpperCase(),
        total: 0,
        cliente: { connect: { ci: Number(cliente_ci) } },
        diagnostico: diagnostico_id ? { connect: { nro: BigInt(diagnostico_id) } } : undefined,
        detalle_proforma: {
          create: detallesData.map(d => ({
            descripcion: d.descripcion.trim(),
            cantidad: toDecimal(d.cantidad),
            precio_unit: toDecimal(d.precio_unit),
            subtotal: toDecimal(d.cantidad) * toDecimal(d.precio_unit)
          }))
        }
      },
      include: { detalle_proforma: true, cliente: true, diagnostico: true }
    });

    // Recalcular total
    const total = await calcularTotal(created.id);

    await bitacora({ req, res, descripcion: `Creación de proforma #${created.id} para cliente ${cliente_ci}` });
 const safeCreated = convertBigIntToString(created);
   safeCreated.total = total;
    return res.status(201).json({ message: 'Proforma creada', proforma: safeCreated });
  } catch (error) {
    console.error('Error creando proforma:', error);
    return res.status(400).json({ error: error.message || 'Error creando proforma' });
  }
};

// Listar proformas paginadas
const getAllProformas = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1'), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '10'), 1), 100);
    const order = (req.query.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [total, rowsRaw] = await Promise.all([
      prisma.proforma.count(),
      prisma.proforma.findMany({
        include: { cliente: true, diagnostico: true, detalle_proforma: true },
        orderBy: { fecha: order },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    const rows = rowsRaw.map(convertBigIntToString);
    return res.json({ data: rows, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (error) {
    console.error('Error listando proformas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Buscar proformas por q (cliente nombre/ci), rango de fecha y estado
const searchProformas = async (req, res) => {
  try {
    const { q = '', estado, from, to, page = '1', pageSize = '10', order = 'desc' } = req.query;
    const pageN = Math.max(parseInt(page), 1);
    const sizeN = Math.min(Math.max(parseInt(pageSize), 1), 100);
    const ord = (order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    const where = {};
    const term = q.toString().trim();

    if (term) {
      where.OR = [
        { cliente: { is: { nombre: { contains: term, mode: 'insensitive' } } } },
        { cliente: { is: { ci: isNaN(Number(term)) ? undefined : Number(term) } } },
        { detalle_proforma: { some: { descripcion: { contains: term, mode: 'insensitive' } } } },
      ].filter(Boolean);
    }
    if (estado) {
      where.estado = estado.toString().toUpperCase();
    }
    const f = parseDateOnly(from);
    const t = parseDateOnly(to);
    if (f || t) {
      where.fecha = {};
      if (f) where.fecha.gte = f;
      if (t) {
        const end = new Date(t);
        end.setHours(23, 59, 59, 999);
        where.fecha.lte = end;
      }
    }

    const [total, rowsRaw] = await Promise.all([
      prisma.proforma.count({ where }),
      prisma.proforma.findMany({
        where,
        include: { cliente: true, diagnostico: true, detalle_proforma: true },
        orderBy: { fecha: ord },
        skip: (pageN - 1) * sizeN,
        take: sizeN
      })
    ]);
    const rows = rowsRaw.map(convertBigIntToString);
    return res.json({ data: rows, pagination: { page: pageN, pageSize: sizeN, total, totalPages: Math.ceil(total / sizeN) } });
  } catch (error) {
    console.error('Error buscando proformas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getProformaById = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await prisma.proforma.findUnique({
      where: { id: BigInt(id) },
      include: { cliente: true, diagnostico: true, detalle_proforma: true }
    });
    if (!p) return res.status(404).json({ error: 'Proforma no encontrada' });
    return res.json(convertBigIntToString(p));
  } catch (error) {
    console.error('Error obteniendo proforma:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateProforma = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, estado, cliente_ci, diagnostico_id, detalles } = req.body;

    const updateData = {};
    if (fecha !== undefined) { Validaciones.fechaProforma(fecha); updateData.fecha = new Date(fecha); }
    if (estado !== undefined) { Validaciones.estadoProforma(estado); updateData.estado = estado.toUpperCase(); }
    if (cliente_ci !== undefined) {
      const cli = await prisma.cliente.findUnique({ where: { ci: Number(cliente_ci) } });
      if (!cli) return res.status(404).json({ error: 'Cliente no encontrado' });
      updateData.cliente = { connect: { ci: Number(cliente_ci) } };
    }
    if (diagnostico_id !== undefined) {
      if (diagnostico_id === null) {
        updateData.diagnostico = { disconnect: true };
      } else {
        const diag = await prisma.diagnostico.findUnique({ where: { nro: BigInt(diagnostico_id) } });
        if (!diag) return res.status(404).json({ error: 'Diagnóstico no encontrado' });
        updateData.diagnostico = { connect: { nro: BigInt(diagnostico_id) } };
      }
    }

    const updated = await prisma.proforma.update({ where: { id: BigInt(id) }, data: updateData });

    // Reemplazar detalles si vienen
    if (Array.isArray(detalles)) {
      for (const d of detalles) {
        Validaciones.descripcionDetalleProforma(d.descripcion || '');
        Validaciones.cantidadProforma(d.cantidad || 0);
        Validaciones.precioUnitario(d.precio_unit || 0);
      }
      await prisma.$transaction([
        prisma.detalle_proforma.deleteMany({ where: { proforma_id: BigInt(id) } }),
        prisma.detalle_proforma.createMany({
          data: detalles.map(d => ({
            proforma_id: BigInt(id),
            descripcion: d.descripcion.trim(),
            cantidad: toDecimal(d.cantidad),
            precio_unit: toDecimal(d.precio_unit),
            subtotal: toDecimal(d.cantidad) * toDecimal(d.precio_unit)
          }))
        })
      ]);
    }

    const total = await calcularTotal(id);
    await bitacora({ req, res, descripcion: `Actualización de proforma #${id}` });
    const safeUpdated = convertBigIntToString(updated);
    safeUpdated.total = total;
    return res.json({ message: 'Proforma actualizada', proforma: safeUpdated });
  } catch (error) {
    console.error('Error actualizando proforma:', error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'Proforma no encontrada' });
    return res.status(400).json({ error: error.message || 'Error actualizando proforma' });
  }
};

const deleteProforma = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await prisma.proforma.delete({ where: { id: BigInt(id) } });
    await bitacora({ req, res, descripcion: `Eliminación de proforma #${id}` });
     return res.json({ message: 'Proforma eliminada', proforma: convertBigIntToString(deleted) });
  } catch (error) {
    console.error('Error eliminando proforma:', error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'Proforma no encontrada' });
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Añadir un detalle individual
const addDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, cantidad, precio_unit } = req.body;
    Validaciones.descripcionDetalleProforma(descripcion || '');
    Validaciones.cantidadProforma(cantidad || 0);
    Validaciones.precioUnitario(precio_unit || 0);
    const det = await prisma.detalle_proforma.create({
      data: {
        proforma_id: BigInt(id),
        descripcion: descripcion.trim(),
        cantidad: toDecimal(cantidad),
        precio_unit: toDecimal(precio_unit),
        subtotal: toDecimal(cantidad) * toDecimal(precio_unit)
      }
    });
    const total = await calcularTotal(id);
    await bitacora({ req, res, descripcion: `Alta de detalle en proforma #${id}` });
    return res.status(201).json({ message: 'Detalle agregado', detalle: convertBigIntToString(det), total });
  } catch (error) {
    console.error('Error agregando detalle:', error);
    return res.status(400).json({ error: error.message || 'Error agregando detalle' });
  }
};

// Eliminar detalle individual
const deleteDetalle = async (req, res) => {
  try {
    const { id, detalleId } = req.params;
    await prisma.detalle_proforma.delete({ where: { id_proforma_id: { id: BigInt(detalleId), proforma_id: BigInt(id) } } });
    const total = await calcularTotal(id);
    await bitacora({ req, res, descripcion: `Eliminación de detalle ${detalleId} en proforma #${id}` });
    return res.json({ message: 'Detalle eliminado', total });
  } catch (error) {
    console.error('Error eliminando detalle:', error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'Detalle no encontrado' });
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createProforma,
  getAllProformas,
  searchProformas,
  getProformaById,
  updateProforma,
  deleteProforma,
  addDetalle,
  deleteDetalle,
};
