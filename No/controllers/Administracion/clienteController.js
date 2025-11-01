require("dotenv").config();
const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();
const Validaciones = require("../../utils/validaciones");
const bitacora = require("../../utils/bitacora").bitacora;

// CREATE - Crear cliente
const createCliente = async (req, res) => {
  const { ci, nombre, telefono, direccion } = req.body;
  try {
    const ci1 = Number(ci);

    // Validaciones
    Validaciones.ci(ci1);
    Validaciones.nombre(nombre);
    Validaciones.telefono(telefono);
    Validaciones.direccion(direccion);

    // Verificar si el cliente ya existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { ci: ci1 },
    });

    if (clienteExistente) {
      return res.status(409).json({ error: "Cliente ya existe" });
    }

    // Crear nuevo cliente
    const newCliente = await prisma.cliente.create({
      data: {
        ci: ci1,
        nombre,
        telefono,
        direccion,
      },
    });

    // Registrar en bitácora
    await bitacora({
      req,
      res,
      descripcion: `Creación de nuevo cliente: ${nombre} con CI: ${ci1}`,
      usuario_id: req.user ? (await prisma.usuario.findUnique({
        where: { usuario: req.user.usuario },
        select: { id: true }
      }))?.id : null,
    });

    res.status(201).json({
      message: "Cliente creado exitosamente",
      cliente: newCliente
    });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(400).json({
      error: error.message || "Un error ocurrió mientras se creaba el cliente.",
    });
  }
};

// READ - Obtener todos los clientes con paginación
const getAllClientes = async (req, res) => {
  try {
    // Parámetros de paginación desde query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'nombre';
    const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';

    // Validar que page y limit sean números positivos
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ 
        error: "Parámetros de paginación inválidos. Page >= 1, Limit entre 1-100" 
      });
    }

    const skip = (page - 1) * limit;

    // Obtener el total de registros
    const totalClientes = await prisma.cliente.count();

    // Obtener clientes paginados
    const clientes = await prisma.cliente.findMany({
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    // Calcular información de paginación
    const totalPages = Math.ceil(totalClientes / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      message: "Clientes obtenidos exitosamente",
      clientes,
      pagination: {
        currentPage: page,
        totalPages,
        totalClientes,
        limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({
      error: error.message || "Un error ocurrió mientras se obtenían los clientes.",
    });
  }
};

// READ - Obtener cliente por CI
const getClienteById = async (req, res) => {
  const { ci } = req.params;
  try {
    const ci1 = Number(ci);
    
    if (isNaN(ci1)) {
      return res.status(400).json({ error: "CI debe ser un número válido" });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { ci: ci1 },
      include: {
        factura: {
          orderBy: { fecha: 'desc' },
          take: 5 // Últimas 5 facturas
        },
        proforma: {
          orderBy: { fecha: 'desc' },
          take: 5 // Últimas 5 proformas
        }
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.status(200).json({
      message: "Cliente encontrado",
      cliente
    });
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    res.status(500).json({
      error: error.message || "Un error ocurrió mientras se obtenía el cliente.",
    });
  }
};

// UPDATE - Actualizar cliente
const updateCliente = async (req, res) => {
  const { ci } = req.params;
  const { nombre, telefono, direccion } = req.body;
  
  try {
    const ci1 = Number(ci);
    
    if (isNaN(ci1)) {
      return res.status(400).json({ error: "CI debe ser un número válido" });
    }

    // Verificar si el cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { ci: ci1 },
    });

    if (!clienteExistente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Validar solo los campos que se van a actualizar
    const updateData = {};
    if (nombre !== undefined) {
      Validaciones.nombre(nombre);
      updateData.nombre = nombre;
    }
    if (telefono !== undefined) {
      Validaciones.telefono(telefono);
      updateData.telefono = telefono;
    }
    if (direccion !== undefined) {
      Validaciones.direccion(direccion);
      updateData.direccion = direccion;
    }

    // Si no hay datos para actualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No hay datos para actualizar" });
    }

    // Actualizar cliente
    const clienteActualizado = await prisma.cliente.update({
      where: { ci: ci1 },
      data: updateData,
    });

    // Registrar en bitácora
    await bitacora({
      req,
      res,
      descripcion: `Actualización de cliente CI: ${ci1} - ${clienteExistente.nombre}`,
      usuario_id: req.user ? (await prisma.usuario.findUnique({
        where: { usuario: req.user.usuario },
        select: { id: true }
      }))?.id : null,
    });

    res.status(200).json({
      message: "Cliente actualizado exitosamente",
      cliente: clienteActualizado
    });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(400).json({
      error: error.message || "Un error ocurrió mientras se actualizaba el cliente.",
    });
  }
};

// DELETE - Eliminar cliente
const deleteCliente = async (req, res) => {
  const { ci } = req.params;
  
  try {
    const ci1 = Number(ci);
    
    if (isNaN(ci1)) {
      return res.status(400).json({ error: "CI debe ser un número válido" });
    }

    // Verificar si el cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { ci: ci1 },
      include: {
        factura: true,
        proforma: true
      }
    });

    if (!clienteExistente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Verificar si el cliente tiene facturas o proformas asociadas
    if (clienteExistente.factura.length > 0 || clienteExistente.proforma.length > 0) {
      return res.status(400).json({ 
        error: "No se puede eliminar el cliente porque tiene facturas o proformas asociadas",
        details: {
          facturas: clienteExistente.factura.length,
          proformas: clienteExistente.proforma.length
        }
      });
    }

    // Eliminar cliente
    await prisma.cliente.delete({
      where: { ci: ci1 },
    });

    // Registrar en bitácora
    await bitacora({
      req,
      res,
      descripcion: `Eliminación de cliente CI: ${ci1} - ${clienteExistente.nombre}`,
      usuario_id: req.user ? (await prisma.usuario.findUnique({
        where: { usuario: req.user.usuario },
        select: { id: true }
      }))?.id : null,
    });

    res.status(200).json({
      message: "Cliente eliminado exitosamente",
      cliente: clienteExistente
    });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({
      error: error.message || "Un error ocurrió mientras se eliminaba el cliente.",
    });
  }
};

// SEARCH - Buscar clientes con paginación
const searchClientes = async (req, res) => {
  const { q, page = 1, limit = 10, sortBy = 'nombre', sortOrder = 'asc' } = req.query;
  
  try {
    if (!q || q.trim() === '') {
      return res.status(400).json({ error: "Parámetro de búsqueda requerido" });
    }

    const searchTerm = q.trim();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Validar parámetros
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ 
        error: "Parámetros de paginación inválidos. Page >= 1, Limit entre 1-100" 
      });
    }

    const skip = (pageNum - 1) * limitNum;

    // Condiciones de búsqueda
    const searchConditions = {
      OR: [
        { ci: isNaN(Number(searchTerm)) ? undefined : Number(searchTerm) },
        { nombre: { contains: searchTerm, mode: 'insensitive' } },
        { telefono: { contains: searchTerm } },
        { direccion: { contains: searchTerm, mode: 'insensitive' } }
      ].filter(condition => condition.ci !== undefined || Object.keys(condition).length > 0)
    };

    // Contar total de resultados
    const totalResults = await prisma.cliente.count({
      where: searchConditions
    });

    // Buscar clientes con paginación
    const clientes = await prisma.cliente.findMany({
      where: searchConditions,
      skip,
      take: limitNum,
      orderBy: { [sortBy]: sortOrder },
    });

    // Información de paginación
    const totalPages = Math.ceil(totalResults / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      message: `Búsqueda completada. ${totalResults} cliente(s) encontrado(s)`,
      clientes,
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
    console.error("Error al buscar clientes:", error);
    res.status(500).json({
      error: error.message || "Un error ocurrió mientras se buscaban los clientes.",
    });
  }
};

module.exports = {
  createCliente,
  getAllClientes,
  getClienteById,
  updateCliente,
  deleteCliente,
  searchClientes,
};