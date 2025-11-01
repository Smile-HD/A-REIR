const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();
const Validaciones = require("../../utils/validaciones");
const { bitacora } = require("../../utils/bitacora");

// Helpers
function validateDescripcion(desc) { Validaciones.descripcionDetalleProforma(desc); }
function validateCategoriaId(id) { const n = Number(id); if (!Number.isInteger(n) || n <= 0) throw new Error('categoria_id inválido'); }

// Crear servicio (admin)
const createServicio = async (req, res) => {
  try {
    const { descripcion, categoria_id } = req.body;
    if (!req.user?.isAdmin) return res.status(403).json({ error: 'Solo administradores pueden crear servicios' });
    validateDescripcion(descripcion);
    validateCategoriaId(categoria_id);

    const cat = await prisma.categoria.findUnique({ where: { id: Number(categoria_id) } });
    if (!cat) return res.status(404).json({ error: 'Categoría no encontrada' });

    const creado = await prisma.servicio.create({ data: { descripcion: descripcion.trim(), categoria: { connect: { id: Number(categoria_id) } } } });
    await bitacora({ req, res, descripcion: `Creación de servicio #${creado.id} - ${creado.descripcion}` });
    return res.status(201).json(creado);
  } catch (error) {
    console.error('Error creando servicio:', error);
    return res.status(400).json({ error: error.message || 'Error creando servicio' });
  }
};

// Listar servicios paginados
const getAllServicios = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1'), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '10'), 1), 100);
    const [total, rows] = await Promise.all([
      prisma.servicio.count(),
      prisma.servicio.findMany({ include: { categoria: true }, orderBy: { descripcion: 'asc' }, skip: (page - 1) * pageSize, take: pageSize })
    ]);
    return res.json({ data: rows, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (error) {
    console.error('Error listando servicios:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Buscar servicios
const searchServicios = async (req, res) => {
  try {
    const { q = '', page = '1', pageSize = '10' } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ error: 'Parámetro q requerido' });
    const pageN = Math.max(parseInt(page), 1);
    const sizeN = Math.min(Math.max(parseInt(pageSize), 1), 100);
    const where = { OR: [ { descripcion: { contains: q.trim(), mode: 'insensitive' } }, ] };
    const [total, rows] = await Promise.all([
      prisma.servicio.count({ where }),
      prisma.servicio.findMany({ where, include: { categoria: true }, orderBy: { descripcion: 'asc' }, skip: (pageN - 1) * sizeN, take: sizeN })
    ]);
    return res.json({ data: rows, pagination: { page: pageN, pageSize: sizeN, total, totalPages: Math.ceil(total / sizeN) } });
  } catch (error) {
    console.error('Error buscando servicios:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener servicio por id
const getServicioById = async (req, res) => {
  try {
    const { id } = req.params;
    const s = await prisma.servicio.findUnique({ where: { id: Number(id) }, include: { categoria: true } });
    if (!s) return res.status(404).json({ error: 'Servicio no encontrado' });
    return res.json(s);
  } catch (error) {
    console.error('Error obteniendo servicio:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar servicio (admin)
const updateServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, categoria_id } = req.body;
    if (!req.user?.isAdmin) return res.status(403).json({ error: 'Solo administradores pueden actualizar servicios' });
    const data = {};
    if (descripcion !== undefined) { validateDescripcion(descripcion); data.descripcion = descripcion.trim(); }
    if (categoria_id !== undefined) { validateCategoriaId(categoria_id); data.categoria = { connect: { id: Number(categoria_id) } }; }
    const up = await prisma.servicio.update({ where: { id: Number(id) }, data });
    await bitacora({ req, res, descripcion: `Actualización de servicio #${id}` });
    return res.json(up);
  } catch (error) {
    console.error('Error actualizando servicio:', error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'Servicio no encontrado' });
    return res.status(400).json({ error: error.message || 'Error actualizando servicio' });
  }
};

// Eliminar servicio (admin)
const deleteServicio = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user?.isAdmin) return res.status(403).json({ error: 'Solo administradores pueden eliminar servicios' });
    const del = await prisma.servicio.delete({ where: { id: Number(id) } });
    await bitacora({ req, res, descripcion: `Eliminación de servicio #${id}` });
    return res.json(del);
  } catch (error) {
    console.error('Error eliminando servicio:', error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'Servicio no encontrado' });
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Listar categorías (para selector)
const getCategorias = async (req, res) => {
  try {
    const cats = await prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
    return res.json(cats);
  } catch (error) {
    console.error('Error listando categorías:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createServicio,
  getAllServicios,
  searchServicios,
  getServicioById,
  updateServicio,
  deleteServicio,
  getCategorias,
};
