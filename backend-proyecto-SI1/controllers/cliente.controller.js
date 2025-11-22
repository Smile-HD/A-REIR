import prisma from '../config/database.js';

// Obtener todos los clientes
export const getAllClientes = async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: {
        ci: 'asc'
      }
    });

    res.json({
      clientes,
      total: clientes.length
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ 
      error: 'Error al obtener clientes',
      details: error.message 
    });
  }
};

// Obtener cliente por CI
export const getClienteById = async (req, res) => {
  try {
    const { ci } = req.params;
    
    const cliente = await prisma.cliente.findUnique({
      where: { ci: parseInt(ci) }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ 
      error: 'Error al obtener cliente',
      details: error.message 
    });
  }
};

// Crear nuevo cliente
export const createCliente = async (req, res) => {
  try {
    const { ci, nombre, apellidos, telefono, direccion } = req.body;

    // Validar campos requeridos
    if (!ci || !nombre || !apellidos || !telefono || !direccion) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // Validar que el CI sea un número
    const ciNumber = parseInt(ci);
    if (isNaN(ciNumber)) {
      return res.status(400).json({ 
        error: 'El CI debe ser un número válido' 
      });
    }

    // Verificar si el cliente ya existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { ci: ciNumber }
    });

    if (clienteExistente) {
      return res.status(400).json({ 
        error: 'Ya existe un cliente con ese CI' 
      });
    }

    // Crear el cliente
    const nuevoCliente = await prisma.cliente.create({
      data: {
        ci: ciNumber,
        nombre,
        apellidos,
        telefono,
        direccion
      }
    });

    res.status(201).json({
      message: 'Cliente creado exitosamente',
      cliente: nuevoCliente
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ 
      error: 'Error al crear cliente',
      details: error.message 
    });
  }
};

// Actualizar cliente
export const updateCliente = async (req, res) => {
  try {
    const { ci } = req.params;
    const { nombre, apellidos, telefono, direccion } = req.body;

    // Verificar si el cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { ci: parseInt(ci) }
    });

    if (!clienteExistente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Actualizar el cliente
    const clienteActualizado = await prisma.cliente.update({
      where: { ci: parseInt(ci) },
      data: {
        nombre: nombre || clienteExistente.nombre,
        apellidos: apellidos || clienteExistente.apellidos,
        telefono: telefono || clienteExistente.telefono,
        direccion: direccion || clienteExistente.direccion
      }
    });

    res.json({
      message: 'Cliente actualizado exitosamente',
      cliente: clienteActualizado
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ 
      error: 'Error al actualizar cliente',
      details: error.message 
    });
  }
};

// Eliminar cliente
export const deleteCliente = async (req, res) => {
  try {
    const { ci } = req.params;

    // Verificar si el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { ci: parseInt(ci) }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Eliminar el cliente
    await prisma.cliente.delete({
      where: { ci: parseInt(ci) }
    });

    res.json({
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ 
      error: 'Error al eliminar cliente',
      details: error.message 
    });
  }
};
