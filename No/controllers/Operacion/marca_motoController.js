require("dotenv").config();
const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();
const Validaciones = require("../../utils/validaciones");
const bitacora = require("../../utils/bitacora").bitacora;

// CREATE - Crear marca
const createMarca = async (req, res) => {
  const { id, nombre } = req.body;
  try {

    // Validaciones
    Validaciones.nombre(nombre);


    // Verificar si la marca ya existe
    const marcaExiste = await prisma.marca_moto.findUnique({
      where: { nombre: nombre },
    });

    if (empleadoExistente) {
      return res.status(409).json({ error: "Empleado ya existe" });
    }

    // Crear nueva marca
    const newMarca = await prisma.marca_moto.create({
      data: {
        nombre
      },
    });

    // Registrar en bitácora
    await bitacora({
      req,
      res,
      descripcion: `Creación de nueva marca de moto: ${nombre} `,
      usuario_id: req.user ? (await prisma.usuario.findUnique({
        where: { usuario: req.user.usuario },
        select: { id: true }
      }))?.id : null,
    });

    res.status(201).json({
      message: "Marca de moto creado exitosamente",
      marca: newMarca
    });
  } catch (error) {
    console.error("Error al crear la marca de moto:", error);
    res.status(400).json({
      error: error.message || "Un error ocurrió mientras se creaba la marca de moto.",
    });
  }
};

// READ - Obtener todos las marca moto con paginación
const getAllMarcas = async (req, res) => {
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
    const totalMarcas = await prisma.marca_moto.count();

    // Obtener empleados paginados
    const marcas = await prisma.marca_moto.findMany({
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        usuario: {
          select: { usuario: true, email: true }
        }
      }
    });

    // Calcular información de paginación
    const totalPages = Math.ceil(totalEmpleados / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      message: "Empleados obtenidos exitosamente",
      marcas,
      pagination: {
        currentPage: page,
        totalPages,
        totalMarcas,
        limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    });
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    res.status(500).json({
      error: error.message || "Un error ocurrió mientras se obtenían los empleados.",
    });
  }
};

// READ - Obtener empleado por CI
const getEmpleadoById = async (req, res) => {
  const { ci } = req.params;
  try {
    const ci1 = Number(ci);
    
    if (isNaN(ci1)) {
      return res.status(400).json({ error: "CI debe ser un número válido" });
    }

    const empleado = await prisma.empleado.findUnique({
      where: { ci: ci1 },
      include: {
        usuario: {
          select: { usuario: true, email: true }
        },
        diagnostico: {
          orderBy: { fecha: 'desc' },
          take: 5 // Últimos 5 diagnósticos
        },
        orden_trabajo: {
          orderBy: { fecha_inicio: 'desc' },
          take: 5 // Últimas 5 órdenes de trabajo
        }
      }
    });

    if (!empleado) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    res.status(200).json({
      message: "Empleado encontrado",
      empleado
    });
  } catch (error) {
    console.error("Error al obtener empleado:", error);
    res.status(500).json({
      error: error.message || "Un error ocurrió mientras se obtenía el empleado.",
    });
  }
};

// UPDATE - Actualizar empleado
const updateEmpleado = async (req, res) => {
  const { ci } = req.params;
  const { nombre, fechanac, direccion, telefono } = req.body;
  
  try {
    const ci1 = Number(ci);
    
    if (isNaN(ci1)) {
      return res.status(400).json({ error: "CI debe ser un número válido" });
    }

    // Verificar si el empleado existe
    const empleadoExistente = await prisma.empleado.findUnique({
      where: { ci: ci1 },
    });

    if (!empleadoExistente) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    // Validar solo los campos que se van a actualizar
    const updateData = {};
    if (nombre !== undefined) {
      Validaciones.nombre(nombre);
      updateData.nombre = nombre;
    }
    if (fechanac !== undefined) {
      Validaciones.Fechanac(fechanac);
      updateData.fechanac = new Date(fechanac);
    }
    if (direccion !== undefined) {
      Validaciones.direccion(direccion);
      updateData.direccion = direccion;
    }
    if (telefono !== undefined) {
      const telefono1 = Number(telefono);
      Validaciones.telefono(telefono1);
      updateData.telefono = telefono1;
    }

    // Si no hay datos para actualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No hay datos para actualizar" });
    }

    // Actualizar empleado
    const empleadoActualizado = await prisma.empleado.update({
      where: { ci: ci1 },
      data: updateData,
    });

    // Registrar en bitácora
    await bitacora({
      req,
      res,
      descripcion: `Actualización de empleado CI: ${ci1} - ${empleadoExistente.nombre}`,
      usuario_id: req.user ? (await prisma.usuario.findUnique({
        where: { usuario: req.user.usuario },
        select: { id: true }
      }))?.id : null,
    });

    res.status(200).json({
      message: "Empleado actualizado exitosamente",
      empleado: empleadoActualizado
    });
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    res.status(400).json({
      error: error.message || "Un error ocurrió mientras se actualizaba el empleado.",
    });
  }
};

// DELETE - Eliminar empleado
const deleteEmpleado = async (req, res) => {
  const { ci } = req.params;
  
  try {
    const ci1 = Number(ci);
    
    if (isNaN(ci1)) {
      return res.status(400).json({ error: "CI debe ser un número válido" });
    }

    // Verificar si el empleado existe
    const empleadoExistente = await prisma.empleado.findUnique({
      where: { ci: ci1 },
      include: {
        diagnostico: true,
        orden_trabajo: true,
        usuario: true
      }
    });

    if (!empleadoExistente) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    // Verificar si el empleado tiene relaciones que impidan su eliminación
    if (empleadoExistente.diagnostico.length > 0 || 
        empleadoExistente.orden_trabajo.length > 0 || 
        empleadoExistente.usuario) {
      return res.status(400).json({ 
        error: "No se puede eliminar el empleado porque tiene registros asociados",
        details: {
          diagnosticos: empleadoExistente.diagnostico.length,
          ordenes_trabajo: empleadoExistente.orden_trabajo.length,
          tiene_usuario: !!empleadoExistente.usuario
        }
      });
    }

    // Eliminar empleado
    await prisma.empleado.delete({
      where: { ci: ci1 },
    });

    // Registrar en bitácora
    await bitacora({
      req,
      res,
      descripcion: `Eliminación de empleado CI: ${ci1} - ${empleadoExistente.nombre}`,
      usuario_id: req.user ? (await prisma.usuario.findUnique({
        where: { usuario: req.user.usuario },
        select: { id: true }
      }))?.id : null,
    });

    res.status(200).json({
      message: "Empleado eliminado exitosamente",
      empleado: empleadoExistente
    });
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    res.status(500).json({
      error: error.message || "Un error ocurrió mientras se eliminaba el empleado.",
    });
  }
};

// SEARCH - Buscar empleados con paginación
const searchEmpleados = async (req, res) => {
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
        { telefono: isNaN(Number(searchTerm)) ? undefined : Number(searchTerm) },
        { direccion: { contains: searchTerm, mode: 'insensitive' } }
      ].filter(condition => condition.ci !== undefined || condition.telefono !== undefined || Object.keys(condition).length > 0)
    };

    // Contar total de resultados
    const totalResults = await prisma.empleado.count({
      where: searchConditions
    });

    // Buscar empleados con paginación
    const empleados = await prisma.empleado.findMany({
      where: searchConditions,
      skip,
      take: limitNum,
      orderBy: { [sortBy]: sortOrder },
      include: {
        usuario: {
          select: { usuario: true, email: true }
        }
      }
    });

    // Información de paginación
    const totalPages = Math.ceil(totalResults / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      message: `Búsqueda completada. ${totalResults} empleado(s) encontrado(s)`,
      empleados,
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
    console.error("Error al buscar empleados:", error);
    res.status(500).json({
      error: error.message || "Un error ocurrió mientras se buscaban los empleados.",
    });
  }
};

module.exports = {
  createMarca,
  getAllEMarca,
  getEmpleadoById,
  updateEmpleado,
  deleteEmpleado,
  searchEmpleados,
};