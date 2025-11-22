import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  useToast,
  HStack,
  VStack,
  Text,
  Badge,
  Grid,
  GridItem,
  Flex,
} from '@chakra-ui/react'
import { AddIcon, EditIcon, DeleteIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import HorarioModal from "../../components/HorarioModal";
import HorarioEmpleadoModal from "../../components/HorarioEmpleadoModal";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import { API_URL } from "../../config";

function GestionHorarios() {
  const [horarios, setHorarios] = useState([])
  const [horariosEmpleados, setHorariosEmpleados] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [selectedHorario, setSelectedHorario] = useState(null)
  const [selectedAsignacion, setSelectedAsignacion] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [loading, setLoading] = useState(false)
  const [vistaActual, setVistaActual] = useState('semana') // 'semana' o 'horarios'
  const [fechaSemana, setFechaSemana] = useState(getStartOfWeek(new Date()))
  
  const { isOpen: isHorarioModalOpen, onOpen: onHorarioModalOpen, onClose: onHorarioModalClose } = useDisclosure()
  const { isOpen: isAsignacionModalOpen, onOpen: onAsignacionModalOpen, onClose: onAsignacionModalClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  
  const toast = useToast()

  // Obtener el inicio de la semana (lunes)
  function getStartOfWeek(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Ajustar al lunes
    return new Date(d.setDate(diff))
  }

  useEffect(() => {
    fetchHorarios()
    fetchEmpleados()
    if (vistaActual === 'semana') {
      fetchHorariosSemana()
    }
  }, [vistaActual, fechaSemana])

  const fetchHorarios = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/horarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setHorarios(data.horarios || [])
    } catch (error) {
      console.error('Error al cargar horarios:', error)
    }
  }

  const fetchEmpleados = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/empleados`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setEmpleados(data.empleados || [])
    } catch (error) {
      console.error('Error al cargar empleados:', error)
    }
  }

  const fetchHorariosSemana = async () => {
    try {
      const token = localStorage.getItem('token')
      const fechaStr = fechaSemana.toISOString().split('T')[0]
      const response = await fetch(`${API_URL}/horarios/semana?fecha=${fechaStr}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setHorariosEmpleados(data.horariosPorEmpleado || [])
    } catch (error) {
      console.error('Error al cargar horarios de la semana:', error)
    }
  }

  const handleSaveHorario = async (horarioData) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const url = selectedHorario 
        ? `${API_URL}/horarios/${selectedHorario.id}`
        : `${API_URL}/horarios`
      
      const response = await fetch(url, {
        method: selectedHorario ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(horarioData)
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: selectedHorario ? 'Horario actualizado' : 'Horario creado',
          status: 'success',
          duration: 3000
        })
        fetchHorarios()
        onHorarioModalClose()
        setSelectedHorario(null)
      } else {
        toast({
          title: 'Error',
          description: data.message,
          status: 'error',
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al guardar el horario',
        status: 'error',
        duration: 3000
      })
    }
    setLoading(false)
  }

  const handleSaveAsignacion = async (asignacionData) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/horarios/asignar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(asignacionData)
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Horario asignado exitosamente',
          status: 'success',
          duration: 3000
        })
        fetchHorariosSemana()
        onAsignacionModalClose()
        setSelectedAsignacion(null)
      } else {
        toast({
          title: 'Error',
          description: data.message,
          status: 'error',
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al asignar el horario',
        status: 'error',
        duration: 3000
      })
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      let url, message

      if (itemToDelete.tipo === 'horario') {
        url = `${API_URL}/horarios/${itemToDelete.id}`
        message = 'Horario eliminado'
      } else {
        url = `${API_URL}/horarios/asignar/${itemToDelete.empleadoCi}/${itemToDelete.horarioId}`
        message = 'Asignación eliminada'
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: message,
          status: 'success',
          duration: 3000
        })
        fetchHorarios()
        fetchHorariosSemana()
      } else {
        toast({
          title: 'Error',
          description: data.message,
          status: 'error',
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar',
        status: 'error',
        duration: 3000
      })
    }
    setLoading(false)
    onDeleteClose()
  }

  const formatTime = (dateTime) => {
    if (!dateTime) return ''
    const date = new Date(dateTime)
    return date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const getDiaSemana = (offset) => {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    return dias[offset]
  }

  const getFechaConOffset = (offset) => {
    const fecha = new Date(fechaSemana)
    fecha.setDate(fecha.getDate() + offset)
    return fecha
  }

  const obtenerHorarioDia = (empleadoCi, offset) => {
    const empleadoData = horariosEmpleados.find(he => he.empleado.ci === empleadoCi)
    if (!empleadoData) return null

    const fechaBuscada = getFechaConOffset(offset).toISOString().split('T')[0]
    const horario = empleadoData.horarios.find(h => {
      const fechaHorario = new Date(h.fecha).toISOString().split('T')[0]
      return fechaHorario === fechaBuscada
    })

    return horario
  }

  const cambiarSemana = (direccion) => {
    const nuevaFecha = new Date(fechaSemana)
    nuevaFecha.setDate(nuevaFecha.getDate() + (direccion * 7))
    setFechaSemana(nuevaFecha)
  }

  const irSemanaActual = () => {
    setFechaSemana(getStartOfWeek(new Date()))
  }

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="md">Gestión de Horarios</Heading>
            <HStack>
              <Button
                size="sm"
                colorScheme={vistaActual === 'semana' ? 'blue' : 'gray'}
                onClick={() => setVistaActual('semana')}
              >
                Vista Semanal
              </Button>
              <Button
                size="sm"
                colorScheme={vistaActual === 'horarios' ? 'blue' : 'gray'}
                onClick={() => setVistaActual('horarios')}
              >
                Gestión de Horarios
              </Button>
            </HStack>
          </Flex>

          {vistaActual === 'semana' && (
            <>
              <HStack justify="space-between">
                <HStack>
                  <IconButton
                    icon={<ChevronLeftIcon />}
                    onClick={() => cambiarSemana(-1)}
                    aria-label="Semana anterior"
                  />
                  <Text fontWeight="bold">
                    Semana del {fechaSemana.toLocaleDateString('es-BO')} al {getFechaConOffset(6).toLocaleDateString('es-BO')}
                  </Text>
                  <IconButton
                    icon={<ChevronRightIcon />}
                    onClick={() => cambiarSemana(1)}
                    aria-label="Semana siguiente"
                  />
                  <Button size="sm" onClick={irSemanaActual}>
                    Hoy
                  </Button>
                </HStack>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  onClick={() => {
                    setSelectedAsignacion(null)
                    onAsignacionModalOpen()
                  }}
                >
                  Asignar Horario
                </Button>
              </HStack>

              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Empleado</Th>
                      {[0, 1, 2, 3, 4, 5, 6].map(offset => (
                        <Th key={offset} textAlign="center">
                          <VStack spacing={0}>
                            <Text fontSize="xs">{getDiaSemana(offset)}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {getFechaConOffset(offset).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })}
                            </Text>
                          </VStack>
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {horariosEmpleados.map(({ empleado }) => (
                      <Tr key={empleado.ci}>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold">{empleado.nombre} {empleado.apellidos}</Text>
                            <Text fontSize="xs" color="gray.500">CI: {empleado.ci}</Text>
                          </VStack>
                        </Td>
                        {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                          const horario = obtenerHorarioDia(empleado.ci, offset)
                          return (
                            <Td key={offset} textAlign="center" p={1}>
                              {horario ? (
                                <Badge
                                  colorScheme="green"
                                  fontSize="xs"
                                  p={2}
                                  cursor="pointer"
                                  onClick={() => {
                                    setItemToDelete({
                                      tipo: 'asignacion',
                                      empleadoCi: horario.empleadoCi,
                                      horarioId: horario.horarioId,
                                      nombre: `${formatTime(horario.horario.horaInicio)} - ${formatTime(horario.horario.horaFin)}`
                                    })
                                    onDeleteOpen()
                                  }}
                                  title="Click para eliminar"
                                >
                                  {formatTime(horario.horario.horaInicio)} - {formatTime(horario.horario.horaFin)}
                                </Badge>
                              ) : (
                                <Text color="gray.300" fontSize="xs">-</Text>
                              )}
                            </Td>
                          )
                        })}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </>
          )}

          {vistaActual === 'horarios' && (
            <>
              <Flex justify="flex-end">
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  onClick={() => {
                    setSelectedHorario(null)
                    onHorarioModalOpen()
                  }}
                >
                  Nuevo Horario
                </Button>
              </Flex>

              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Hora Inicio</Th>
                    <Th>Hora Fin</Th>
                    <Th>Duración</Th>
                    <Th>Empleados Asignados</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {horarios.map((horario) => {
                    const inicio = new Date(horario.horaInicio)
                    const fin = new Date(horario.horaFin)
                    const duracion = (fin - inicio) / (1000 * 60 * 60) // horas
                    
                    return (
                      <Tr key={horario.id}>
                        <Td>{horario.id}</Td>
                        <Td>
                          <Badge colorScheme="blue">
                            {formatTime(horario.horaInicio)}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme="purple">
                            {formatTime(horario.horaFin)}
                          </Badge>
                        </Td>
                        <Td>{duracion.toFixed(1)} hrs</Td>
                        <Td>
                          <Badge colorScheme="green">
                            {horario._count.horarioEmpleados} empleado(s)
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              icon={<EditIcon />}
                              size="sm"
                              colorScheme="yellow"
                              onClick={() => {
                                setSelectedHorario(horario)
                                onHorarioModalOpen()
                              }}
                            />
                            <IconButton
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => {
                                setItemToDelete({
                                  tipo: 'horario',
                                  id: horario.id,
                                  nombre: `${formatTime(horario.horaInicio)} - ${formatTime(horario.horaFin)}`
                                })
                                onDeleteOpen()
                              }}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>
            </>
          )}
        </VStack>

        {/* Modales */}
        <HorarioModal
          isOpen={isHorarioModalOpen}
          onClose={onHorarioModalClose}
          horario={selectedHorario}
          onSave={handleSaveHorario}
        />

        <HorarioEmpleadoModal
          isOpen={isAsignacionModalOpen}
          onClose={onAsignacionModalClose}
          empleados={empleados}
          horarios={horarios}
          onSave={handleSaveAsignacion}
        />

        <DeleteConfirmDialog
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          onConfirm={handleDelete}
          itemName={itemToDelete?.nombre}
          isLoading={loading}
        />
      </CardBody>
    </Card>
  )
}

export default GestionHorarios
