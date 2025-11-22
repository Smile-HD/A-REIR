import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  useToast,
  Spinner,
  Text,
  HStack,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon, AddIcon, SearchIcon, InfoIcon } from "@chakra-ui/icons";
import OrdenTrabajoModal from "../../components/OrdenTrabajoModal";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import { API_URL } from "../../config";

function GestionOrdenesTrabajo() {
  const [ordenes, setOrdenes] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [detallesProforma, setDetallesProforma] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrden, setSelectedOrden] = useState(null)
  const [ordenToDelete, setOrdenToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const toast = useToast()

 
  useEffect(() => {
    fetchOrdenes()
    fetchEmpleados()
    fetchUsuarios()
    fetchDetallesProforma()
  }, [])

  const fetchOrdenes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/ordenes-trabajo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al cargar las órdenes de trabajo')
      }
      
      const data = await response.json()
      
      // Asegurar que siempre sea un array
      if (Array.isArray(data)) {
        setOrdenes(data)
      } else {
        console.error('La respuesta no es un array:', data)
        setOrdenes([])
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error en fetchOrdenes:', error)
      setOrdenes([])
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las órdenes de trabajo',
        status: 'error',
        duration: 3000,
      })
      setLoading(false)
    }
  }

  const fetchEmpleados = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/empleados`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setEmpleados(data.empleados || [])
    } catch (error) {
      console.error('Error al cargar empleados:', error)
    }
  }

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setUsuarios(data.usuarios || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    }
  }

  const fetchDetallesProforma = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/proformas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      // Extraer todos los detalles de todas las proformas con información completa
      const detalles = []
      data.proformas?.forEach(proforma => {
        proforma.detalles?.forEach(detalle => {
          detalles.push({
            ...detalle,
            proformaId: proforma.id,
            proforma: {
              id: proforma.id,
              estado: proforma.estado,
              total: proforma.total,
              fecha: proforma.fecha,
              cliente: proforma.cliente ? {
                nombre: proforma.cliente.nombre,
                apellidos: proforma.cliente.apellidos,
                ci: proforma.cliente.ci
              } : null
            }
          })
        })
      })
      setDetallesProforma(detalles)
    } catch (error) {
      console.error('Error al cargar detalles de proforma:', error)
    }
  }

  const handleCreate = () => {
    setSelectedOrden(null)
    onOpen()
  }

  const handleEdit = (orden) => {
    setSelectedOrden(orden)
    onOpen()
  }

  const handleDelete = (orden) => {
    setOrdenToDelete(orden)
    onDeleteOpen()
  }

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/ordenes-trabajo/${ordenToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Orden de trabajo eliminada',
          status: 'success',
          duration: 3000,
        })
        fetchOrdenes()
      } else {
        throw new Error('Error al eliminar')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la orden de trabajo',
        status: 'error',
        duration: 3000,
      })
    }
    onDeleteClose()
  }

  const handleSave = async (ordenData) => {
    try {
      const token = localStorage.getItem('token')
      const url = selectedOrden 
        ? `${API_URL}/ordenes-trabajo/${selectedOrden.id}`
        : `${API_URL}/ordenes-trabajo`
      
      const method = selectedOrden ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ordenData)
      })

      if (response.ok) {
        toast({
          title: selectedOrden ? 'Orden actualizada' : 'Orden creada',
          status: 'success',
          duration: 3000,
        })
        fetchOrdenes()
        onClose()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }

  const filteredOrdenes = Array.isArray(ordenes) ? ordenes.filter(orden => {
    const matchesSearch = 
      orden.id.toString().includes(searchTerm) ||
      orden.empleado?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.empleado?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEstado = !estadoFilter || orden.estado === estadoFilter

    return matchesSearch && matchesEstado
  }) : []

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES')
  }

  const getEstadoBadgeColor = (estado) => {
    const colors = {
      ABIERTA: 'blue',
      EN_PROCESO: 'yellow',
      FINALIZADA: 'green',
      CANCELADA: 'red'
    }
    return colors[estado] || 'gray'
  }

  const getEstadoLabel = (estado) => {
    const labels = {
      ABIERTA: 'Abierta',
      EN_PROCESO: 'En Proceso',
      FINALIZADA: 'Finalizada',
      CANCELADA: 'Cancelada'
    }
    return labels[estado] || estado
  }

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="teal.500" />
      </Box>
    )
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement>
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar órdenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Select
            placeholder="Todos los estados"
            maxW="200px"
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
          >
            <option value="ABIERTA">Abierta</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="FINALIZADA">Finalizada</option>
            <option value="CANCELADA">Cancelada</option>
          </Select>
        </HStack>

        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={handleCreate}>
          Nueva Orden de Trabajo
        </Button>
      </HStack>

      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>ID</Th>
              <Th>Fecha Inicio</Th>
              <Th>Fecha Fin</Th>
              <Th>Estado</Th>
              <Th>Empleado</Th>
              <Th>Usuario</Th>
              <Th minW="300px">Detalle y Proforma</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredOrdenes.length === 0 ? (
              <Tr>
                <Td colSpan={8} textAlign="center" py={8}>
                  <Text color="gray.500">No hay órdenes de trabajo registradas</Text>
                </Td>
              </Tr>
            ) : (
              filteredOrdenes.map((orden) => (
                <Tr key={orden.id} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="medium">#{orden.id}</Td>
                  <Td>{formatDate(orden.fechaInicio)}</Td>
                  <Td>{formatDate(orden.fechaFin)}</Td>
                  <Td>
                    <Badge colorScheme={getEstadoBadgeColor(orden.estado)}>
                      {getEstadoLabel(orden.estado)}
                    </Badge>
                  </Td>
                  <Td>
                    {orden.empleado ? (
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium" fontSize="sm">
                          {orden.empleado.nombre} {orden.empleado.apellidos}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          CI: {orden.empleado.ci}
                        </Text>
                      </VStack>
                    ) : (
                      <Text color="gray.400">N/A</Text>
                    )}
                  </Td>
                  <Td>
                    {orden.usuario ? (
                      <Badge colorScheme="purple">
                        {orden.usuario.username}
                      </Badge>
                    ) : (
                      <Badge colorScheme="gray">Sin usuario</Badge>
                    )}
                  </Td>
                  <Td>
                    {orden.detalle ? (
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Text fontSize="sm" fontWeight="medium">
                            Detalle #{orden.detalle.id}
                          </Text>
                          <Tooltip 
                            label={
                              <Box p={2}>
                                <Text fontWeight="bold" mb={1}>{orden.detalle.descripcion}</Text>
                                <Text fontSize="xs">Cantidad: {orden.detalle.cantidad}</Text>
                                <Text fontSize="xs">Precio unitario: Bs {parseFloat(orden.detalle.precioUnit).toFixed(2)}</Text>
                                <Text fontSize="xs" fontWeight="bold" mt={1}>
                                  Subtotal: Bs {(parseFloat(orden.detalle.cantidad) * parseFloat(orden.detalle.precioUnit)).toFixed(2)}
                                </Text>
                              </Box>
                            }
                            placement="top"
                          >
                            <InfoIcon color="blue.500" boxSize={3} />
                          </Tooltip>
                        </HStack>
                        
                        {orden.detalle.proforma ? (
                          <VStack align="start" spacing={0} pl={2} borderLeftWidth={2} borderColor="teal.300">
                            <HStack spacing={2}>
                              <Text fontSize="xs" fontWeight="semibold" color="teal.600">
                                Proforma #{orden.detalle.proforma.id}
                              </Text>
                              <Badge 
                                size="sm" 
                                colorScheme={
                                  orden.detalle.proforma.estado === 'APROBADA' ? 'green' :
                                  orden.detalle.proforma.estado === 'COMPLETADA' ? 'blue' :
                                  orden.detalle.proforma.estado === 'PENDIENTE' ? 'yellow' :
                                  'red'
                                }
                                fontSize="xs"
                              >
                                {orden.detalle.proforma.estado}
                              </Badge>
                            </HStack>
                            {orden.detalle.proforma.cliente && (
                              <Text fontSize="xs" color="gray.600">
                                Cliente: {orden.detalle.proforma.cliente.nombre} {orden.detalle.proforma.cliente.apellidos}
                              </Text>
                            )}
                            <Text fontSize="xs" color="gray.700" fontWeight="medium">
                              Total: Bs {parseFloat(orden.detalle.proforma.total).toFixed(2)}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              Fecha: {new Date(orden.detalle.proforma.fecha).toLocaleDateString('es-ES')}
                            </Text>
                          </VStack>
                        ) : (
                          <Badge colorScheme="gray" size="sm">Sin proforma</Badge>
                        )}
                      </VStack>
                    ) : (
                      <Badge colorScheme="gray">Sin detalle</Badge>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEdit(orden)}
                        aria-label="Editar orden"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(orden)}
                        aria-label="Eliminar orden"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      <OrdenTrabajoModal
        isOpen={isOpen}
        onClose={onClose}
        orden={selectedOrden}
        empleados={empleados}
        usuarios={usuarios}
        detallesProforma={detallesProforma}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Eliminar Orden de Trabajo"
        message={`¿Estás seguro de eliminar la orden de trabajo #${ordenToDelete?.id}?`}
      />
    </Box>
  )
}

export default GestionOrdenesTrabajo
