import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Obtener todos los horarios
export const getAllHorarios = async (req, res) => {
  try {
    const horarios = await prisma.horario.findMany({
      include: {
        _count: {
          select: { horarioEmpleados: true }
        }
      },
      orderBy: { horaInicio: 'asc' }
    })

    res.json({ horarios })
  } catch (error) {
    console.error('Error al obtener horarios:', error)
    res.status(500).json({ message: 'Error al obtener horarios', error: error.message })
  }
}

// Obtener horario por ID
export const getHorarioById = async (req, res) => {
  try {
    const { id } = req.params
    const horario = await prisma.horario.findUnique({
      where: { id: parseInt(id) },
      include: {
        horarioEmpleados: {
          include: {
            empleado: true
          }
        }
      }
    })

    if (!horario) {
      return res.status(404).json({ message: 'Horario no encontrado' })
    }

    res.json({ horario })
  } catch (error) {
    console.error('Error al obtener horario:', error)
    res.status(500).json({ message: 'Error al obtener horario', error: error.message })
  }
}

// Crear nuevo horario
export const createHorario = async (req, res) => {
  try {
    const { horaInicio, horaFin } = req.body

    // Validar que horaFin > horaInicio
    if (horaFin <= horaInicio) {
      return res.status(400).json({ message: 'La hora de fin debe ser mayor a la hora de inicio' })
    }

    const horario = await prisma.horario.create({
      data: {
        horaInicio: new Date(`1970-01-01T${horaInicio}`),
        horaFin: new Date(`1970-01-01T${horaFin}`)
      }
    })

    res.status(201).json({ message: 'Horario creado exitosamente', horario })
  } catch (error) {
    console.error('Error al crear horario:', error)
    res.status(500).json({ message: 'Error al crear horario', error: error.message })
  }
}

// Actualizar horario
export const updateHorario = async (req, res) => {
  try {
    const { id } = req.params
    const { horaInicio, horaFin } = req.body

    // Validar que horaFin > horaInicio
    if (horaFin <= horaInicio) {
      return res.status(400).json({ message: 'La hora de fin debe ser mayor a la hora de inicio' })
    }

    const horario = await prisma.horario.update({
      where: { id: parseInt(id) },
      data: {
        horaInicio: new Date(`1970-01-01T${horaInicio}`),
        horaFin: new Date(`1970-01-01T${horaFin}`)
      }
    })

    res.json({ message: 'Horario actualizado exitosamente', horario })
  } catch (error) {
    console.error('Error al actualizar horario:', error)
    res.status(500).json({ message: 'Error al actualizar horario', error: error.message })
  }
}

// Eliminar horario
export const deleteHorario = async (req, res) => {
  try {
    const { id } = req.params

    await prisma.horario.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: 'Horario eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar horario:', error)
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        message: 'No se puede eliminar el horario porque tiene empleados asignados' 
      })
    }
    res.status(500).json({ message: 'Error al eliminar horario', error: error.message })
  }
}

// Obtener horarios de empleados (vista de calendario)
export const getHorariosEmpleados = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, empleadoCi } = req.query

    const where = {}
    
    if (fechaInicio && fechaFin) {
      where.fecha = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin)
      }
    }

    if (empleadoCi) {
      where.empleadoCi = parseInt(empleadoCi)
    }

    const horariosEmpleados = await prisma.horarioEmpleado.findMany({
      where,
      include: {
        empleado: true,
        horario: true
      },
      orderBy: [
        { fecha: 'asc' },
        { horario: { horaInicio: 'asc' } }
      ]
    })

    res.json({ horariosEmpleados })
  } catch (error) {
    console.error('Error al obtener horarios de empleados:', error)
    res.status(500).json({ message: 'Error al obtener horarios de empleados', error: error.message })
  }
}

// Asignar horario a empleado
export const asignarHorarioEmpleado = async (req, res) => {
  try {
    const { empleadoCi, horarioId, fecha } = req.body

    // Verificar que el empleado existe
    const empleado = await prisma.empleado.findUnique({
      where: { ci: parseInt(empleadoCi) }
    })
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' })
    }

    // Verificar que el horario existe
    const horario = await prisma.horario.findUnique({
      where: { id: parseInt(horarioId) }
    })
    if (!horario) {
      return res.status(404).json({ message: 'Horario no encontrado' })
    }

    // Verificar si ya existe una asignación para este empleado y horario
    const existente = await prisma.horarioEmpleado.findUnique({
      where: {
        empleadoCi_horarioId: {
          empleadoCi: parseInt(empleadoCi),
          horarioId: parseInt(horarioId)
        }
      }
    })

    if (existente) {
      // Actualizar la fecha
      const horarioEmpleado = await prisma.horarioEmpleado.update({
        where: {
          empleadoCi_horarioId: {
            empleadoCi: parseInt(empleadoCi),
            horarioId: parseInt(horarioId)
          }
        },
        data: {
          fecha: new Date(fecha)
        },
        include: {
          empleado: true,
          horario: true
        }
      })
      return res.json({ message: 'Horario actualizado exitosamente', horarioEmpleado })
    }

    // Crear nueva asignación
    const horarioEmpleado = await prisma.horarioEmpleado.create({
      data: {
        empleadoCi: parseInt(empleadoCi),
        horarioId: parseInt(horarioId),
        fecha: new Date(fecha)
      },
      include: {
        empleado: true,
        horario: true
      }
    })

    res.status(201).json({ message: 'Horario asignado exitosamente', horarioEmpleado })
  } catch (error) {
    console.error('Error al asignar horario:', error)
    res.status(500).json({ message: 'Error al asignar horario', error: error.message })
  }
}

// Eliminar asignación de horario a empleado
export const eliminarHorarioEmpleado = async (req, res) => {
  try {
    const { empleadoCi, horarioId } = req.params

    await prisma.horarioEmpleado.delete({
      where: {
        empleadoCi_horarioId: {
          empleadoCi: parseInt(empleadoCi),
          horarioId: parseInt(horarioId)
        }
      }
    })

    res.json({ message: 'Asignación de horario eliminada exitosamente' })
  } catch (error) {
    console.error('Error al eliminar asignación:', error)
    res.status(500).json({ message: 'Error al eliminar asignación', error: error.message })
  }
}

// Obtener horarios por semana (vista calendario semanal)
export const getHorariosSemana = async (req, res) => {
  try {
    const { fecha } = req.query // fecha de inicio de la semana

    const fechaInicio = new Date(fecha)
    const fechaFin = new Date(fecha)
    fechaFin.setDate(fechaFin.getDate() + 6) // 7 días

    const horariosEmpleados = await prisma.horarioEmpleado.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        }
      },
      include: {
        empleado: true,
        horario: true
      },
      orderBy: [
        { empleadoCi: 'asc' },
        { fecha: 'asc' }
      ]
    })

    // Agrupar por empleado
    const empleados = await prisma.empleado.findMany({
      orderBy: { apellidos: 'asc' }
    })

    const horariosPorEmpleado = empleados.map(empleado => {
      const horarios = horariosEmpleados.filter(he => he.empleadoCi === empleado.ci)
      return {
        empleado,
        horarios
      }
    })

    res.json({ 
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0],
      horariosPorEmpleado 
    })
  } catch (error) {
    console.error('Error al obtener horarios de la semana:', error)
    res.status(500).json({ message: 'Error al obtener horarios de la semana', error: error.message })
  }
}
