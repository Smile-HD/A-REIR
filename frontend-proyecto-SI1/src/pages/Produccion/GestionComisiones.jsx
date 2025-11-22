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
  VStack,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { 
  EditIcon, 
  DeleteIcon, 
  AddIcon, 
  SearchIcon, 
  CheckIcon, 
  InfoIcon,
  ChevronDownIcon 
} from '@chakra-ui/icons'
import ComisionModal from '../../components/ComisionModal'
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog'
import { API_URL } from '../../config'

function GestionComisiones() {
  const [comisiones, setComisiones] = useState([])
  const [ordenesFinalizadas, setOrdenesFinalizadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComision, setSelectedComision] = useState(null)
  const [comisionToDelete, setComisionToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const toast = useToast()

 
  useEffect(() => {
    fetchComisiones()
    fetchOrdenesFinalizadas()
  }, [])

  const fetchComisiones = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/comisiones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al cargar las comisiones')
      }
      
      const data = await response.json()
      
      // Asegurar que siempre sea un array
      if (Array.isArray(data)) {
        setComisiones(data)
      } else {
        console.error('La respuesta no es un array:', data)
        setComisiones([])
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error en fetchComisiones:', error)
      setComisiones([])
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las comisiones',
        status: 'error',
        duration: 3000,
      })
      setLoading(false)
    }
  }

  const fetchOrdenesFinalizadas = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/ordenes-trabajo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      // Filtrar solo órdenes finalizadas sin comisión
      const ordenesFiltradas = data.filter(orden => 
        orden.estado === 'FINALIZADA' && !orden.comision
      )
      setOrdenesFinalizadas(ordenesFiltradas)
    } catch (error) {
      console.error('Error al cargar órdenes:', error)
    }
  }

  const handleCreate = () => {
    setSelectedComision(null)
    onOpen()
  }

  const handleEdit = (comision) => {
    setSelectedComision(comision)
    onOpen()
  }

  const handleDelete = (comision) => {
    setComisionToDelete(comision)
    onDeleteOpen()
  }

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/comisiones/${comisionToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Comisión eliminada',
          status: 'success',
          duration: 3000,
        })
        fetchComisiones()
        fetchOrdenesFinalizadas()
      } else {
        throw new Error('Error al eliminar')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la comisión',
        status: 'error',
        duration: 3000,
      })
    }
    onDeleteClose()
  }

  const handleSave = async (comisionData) => {
    try {
      const token = localStorage.getItem('token')
      const url = selectedComision 
        ? `${API_URL}/comisiones/${selectedComision.id}`
        : `${API_URL}/comisiones`
      
      const method = selectedComision ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(comisionData)
      })

      if (response.ok) {
        toast({
          title: selectedComision ? 'Comisión actualizada' : 'Comisión creada',
          status: 'success',
          duration: 3000,
        })
        fetchComisiones()
        fetchOrdenesFinalizadas()
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

  const handleMarcarPagada = async (comision) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/comisiones/${comision.id}/pagar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fechaPago: new Date().toISOString().split('T')[0]
        })
      })

      if (response.ok) {
        toast({
          title: 'Comisión marcada como pagada',
          status: 'success',
          duration: 3000,
        })
        fetchComisiones()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error al marcar como pagada')
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

  const filteredComisiones = Array.isArray(comisiones) ? comisiones.filter(comision => {
    const matchesSearch = 
      comision.id.toString().includes(searchTerm) ||
      comision.ordenTrabajo?.empleado?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comision.ordenTrabajo?.empleado?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comision.monto.toString().includes(searchTerm)
    
    const matchesEstado = !estadoFilter || comision.estadoPago === estadoFilter

    return matchesSearch && matchesEstado
  }) : []

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES')
  }

  const formatCurrency = (amount) => {
    return `Bs. ${parseFloat(amount).toFixed(2)}`
  }

  const getEstadoBadgeColor = (estado) => {
    const colors = {
      PENDIENTE: 'yellow',
      PAGADO: 'green',
      CANCELADO: 'red'
    }
    return colors[estado] || 'gray'
  }

  const getEstadoLabel = (estado) => {
    const labels = {
      PENDIENTE: 'Pendiente',
      PAGADO: 'Pagado',
      CANCELADO: 'Cancelado'
    }
    return labels[estado] || estado
  }

  // Calcular totales
  const totalPendiente = comisiones
    .filter(c => c.estadoPago === 'PENDIENTE')
    .reduce((sum, c) => sum + parseFloat(c.monto), 0)
  
  const totalPagado = comisiones
    .filter(c => c.estadoPago === 'PAGADO')
    .reduce((sum, c) => sum + parseFloat(c.monto), 0)

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="teal.500" />
      </Box>
    )
  }

  return (
    <Box>
      {/* Estadísticas */}
      <HStack spacing={4} mb={6} flexWrap="wrap">
        <Box bg="yellow.50" p={4} borderRadius="lg" minW="200px">
          <Text fontSize="sm" color="gray.600">Total Pendiente</Text>
          <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
            {formatCurrency(totalPendiente)}
          </Text>
        </Box>
        <Box bg="green.50" p={4} borderRadius="lg" minW="200px">
          <Text fontSize="sm" color="gray.600">Total Pagado</Text>
          <Text fontSize="2xl" fontWeight="bold" color="green.600">
            {formatCurrency(totalPagado)}
          </Text>
        </Box>
      </HStack>

      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement>
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar comisiones..."
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
            <option value="PENDIENTE">Pendiente</option>
            <option value="PAGADO">Pagado</option>
            <option value="CANCELADO">Cancelado</option>
          </Select>
        </HStack>

        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={handleCreate}>
          Nueva Comisión
        </Button>
      </HStack>

      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>ID</Th>
              <Th>Orden</Th>
              <Th>Empleado</Th>
              <Th>Monto</Th>
              <Th>Estado</Th>
              <Th>Fecha Pago</Th>
              <Th>Servicio</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredComisiones.length === 0 ? (
              <Tr>
                <Td colSpan={8} textAlign="center" py={8}>
                  <Text color="gray.500">No hay comisiones registradas</Text>
                </Td>
              </Tr>
            ) : (
              filteredComisiones.map((comision) => (
                <Tr key={comision.id} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="medium">#{comision.id}</Td>
                  <Td>
                    {comision.ordenTrabajo ? (
                      <Text fontSize="sm">#{comision.ordenTrabajo.id}</Text>
                    ) : (
                      <Badge colorScheme="gray">Sin orden</Badge>
                    )}
                  </Td>
                  <Td>
                    {comision.ordenTrabajo?.empleado ? (
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium" fontSize="sm">
                          {comision.ordenTrabajo.empleado.nombre} {comision.ordenTrabajo.empleado.apellidos}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          CI: {comision.ordenTrabajo.empleado.ci}
                        </Text>
                      </VStack>
                    ) : (
                      <Text color="gray.400">N/A</Text>
                    )}
                  </Td>
                  <Td>
                    <Text fontWeight="bold" color="teal.600">
                      {formatCurrency(comision.monto)}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={getEstadoBadgeColor(comision.estadoPago)}>
                      {getEstadoLabel(comision.estadoPago)}
                    </Badge>
                  </Td>
                  <Td>{formatDate(comision.fechaPago)}</Td>
                  <Td>
                    {comision.ordenTrabajo?.detalle ? (
                      <HStack>
                        <Text fontSize="sm" noOfLines={1}>
                          {comision.ordenTrabajo.detalle.descripcion}
                        </Text>
                        <Tooltip 
                          label={
                            <Box p={2}>
                              <Text fontWeight="bold">{comision.ordenTrabajo.detalle.descripcion}</Text>
                              <Text fontSize="xs">Cantidad: {comision.ordenTrabajo.detalle.cantidad}</Text>
                              <Text fontSize="xs">Precio: {formatCurrency(comision.ordenTrabajo.detalle.precioUnit)}</Text>
                              {comision.ordenTrabajo.detalle.proforma?.cliente && (
                                <Text fontSize="xs" mt={1}>
                                  Cliente: {comision.ordenTrabajo.detalle.proforma.cliente.nombre} {comision.ordenTrabajo.detalle.proforma.cliente.apellidos}
                                </Text>
                              )}
                            </Box>
                          }
                          placement="top"
                        >
                          <InfoIcon color="blue.500" boxSize={3} />
                        </Tooltip>
                      </HStack>
                    ) : (
                      <Badge colorScheme="gray">Sin servicio</Badge>
                    )}
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<ChevronDownIcon />}
                        size="sm"
                        variant="ghost"
                      />
                      <MenuList>
                        <MenuItem 
                          icon={<EditIcon />} 
                          onClick={() => handleEdit(comision)}
                        >
                          Editar
                        </MenuItem>
                        {comision.estadoPago === 'PENDIENTE' && (
                          <MenuItem 
                            icon={<CheckIcon />} 
                            onClick={() => handleMarcarPagada(comision)}
                            color="green.600"
                          >
                            Marcar como Pagada
                          </MenuItem>
                        )}
                        <MenuItem 
                          icon={<DeleteIcon />} 
                          onClick={() => handleDelete(comision)}
                          color="red.600"
                        >
                          Eliminar
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      <ComisionModal
        isOpen={isOpen}
        onClose={onClose}
        comision={selectedComision}
        ordenesFinalizadas={ordenesFinalizadas}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Eliminar Comisión"
        message={`¿Estás seguro de eliminar la comisión #${comisionToDelete?.id} de ${formatCurrency(comisionToDelete?.monto)}?`}
      />
    </Box>
  )
}

export default GestionComisiones
