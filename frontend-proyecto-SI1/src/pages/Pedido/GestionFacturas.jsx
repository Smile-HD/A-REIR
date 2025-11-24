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
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Text,
  VStack,
  Select,
  Spinner,
  Tooltip,
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon, AddIcon, SearchIcon } from '@chakra-ui/icons'
import { FaFileInvoice, FaBan, FaFilePdf } from 'react-icons/fa'
import FacturaModal from '../../components/FacturaModal'
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog'
import { API_URL } from '../../config'

function GestionFacturas() {
  const [facturas, setFacturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFactura, setSelectedFactura] = useState(null)
  const [facturaToDelete, setFacturaToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    fetchFacturas()
  }, [])

  const fetchFacturas = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/facturas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al cargar las facturas')
      }
      
      const data = await response.json()
      setFacturas(data.facturas || [])
      setLoading(false)
    } catch (error) {
      console.error('Error en fetchFacturas:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las facturas',
        status: 'error',
        duration: 3000,
      })
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedFactura(null)
    onOpen()
  }

  const handleEdit = (factura) => {
    setSelectedFactura(factura)
    onOpen()
  }

  const handleDelete = (factura) => {
    setFacturaToDelete(factura)
    onDeleteOpen()
  }

  const handleAnular = async (factura) => {
    if (factura.estado === 'ANULADA') {
      toast({
        title: 'Información',
        description: 'Esta factura ya está anulada',
        status: 'info',
        duration: 3000,
      })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/facturas/${factura.nro}/anular`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Factura anulada',
          status: 'success',
          duration: 3000,
        })
        fetchFacturas()
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'No se pudo anular la factura',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo anular la factura',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/facturas/${facturaToDelete.nro}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Factura eliminada',
          status: 'success',
          duration: 3000,
        })
        fetchFacturas()
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'No se pudo eliminar la factura',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la factura',
        status: 'error',
        duration: 3000,
      })
    }
    onDeleteClose()
  }

  const handleGeneratePDF = (factura) => {
    const token = localStorage.getItem('token')
    window.open(
      `${API_URL}/facturas/${factura.nro}/pdf?token=${token}`,
      '_blank'
    )
  }

  const handleSave = async (facturaData) => {
    try {
      const token = localStorage.getItem('token')
      const url = selectedFactura 
        ? `${API_URL}/facturas/${selectedFactura.nro}`
        : `${API_URL}/facturas`
      
      const method = selectedFactura ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(facturaData)
      })

      if (response.ok) {
        toast({
          title: selectedFactura ? 'Factura actualizada' : 'Factura creada',
          status: 'success',
          duration: 3000,
        })
        fetchFacturas()
        onClose()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Error al guardar factura')
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

  const filteredFacturas = facturas.filter(factura => {
    const matchesSearch = 
      factura.nro.toString().includes(searchTerm) ||
      factura.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.cliente?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEstado = !estadoFilter || factura.estado === estadoFilter

    return matchesSearch && matchesEstado
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEstadoBadgeColor = (estado) => {
    return estado === 'EMITIDA' ? 'green' : 'red'
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
              placeholder="Buscar facturas..."
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
            <option value="EMITIDA">Emitida</option>
            <option value="ANULADA">Anulada</option>
          </Select>
        </HStack>

        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={handleCreate}>
          Nueva Factura
        </Button>
      </HStack>

      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Nro. Factura</Th>
              <Th>Fecha</Th>
              <Th>Cliente</Th>
              <Th>Total</Th>
              <Th>Estado</Th>
              <Th>Proforma</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredFacturas.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py={8}>
                  <Text color="gray.500">No hay facturas registradas</Text>
                </Td>
              </Tr>
            ) : (
              filteredFacturas.map((factura) => (
                <Tr key={factura.nro} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="medium">#{factura.nro}</Td>
                  <Td fontSize="sm">{formatDate(factura.fecha)}</Td>
                  <Td>
                    {factura.cliente ? (
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium" fontSize="sm">
                          {factura.cliente.nombre} {factura.cliente.apellidos}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          CI: {factura.cliente.ci}
                        </Text>
                      </VStack>
                    ) : (
                      <Text color="gray.400">N/A</Text>
                    )}
                  </Td>
                  <Td fontWeight="bold" color="green.600">
                    Bs {parseFloat(factura.total).toFixed(2)}
                  </Td>
                  <Td>
                    <Badge colorScheme={getEstadoBadgeColor(factura.estado)}>
                      {factura.estado}
                    </Badge>
                  </Td>
                  <Td>
                    {factura.proforma ? (
                      <Badge colorScheme="blue">
                        Proforma #{factura.proforma.id}
                      </Badge>
                    ) : (
                      <Text fontSize="sm" color="gray.400">Sin proforma</Text>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="Descargar factura" placement="top">
                        <IconButton
                          icon={<FaFilePdf />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleGeneratePDF(factura)}
                          aria-label="Descargar factura"
                        />
                      </Tooltip>
                      {factura.estado === 'EMITIDA' && (
                        <Tooltip label="Anular factura" placement="top">
                          <IconButton
                            icon={<FaBan />}
                            size="sm"
                            colorScheme="orange"
                            variant="ghost"
                            onClick={() => handleAnular(factura)}
                            aria-label="Anular factura"
                          />
                        </Tooltip>
                      )}
                      <Tooltip label="Editar" placement="top">
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => handleEdit(factura)}
                          aria-label="Editar factura"
                          isDisabled={factura.estado === 'ANULADA'}
                        />
                      </Tooltip>
                      <Tooltip label="Eliminar" placement="top">
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDelete(factura)}
                          aria-label="Eliminar factura"
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      <FacturaModal
        isOpen={isOpen}
        onClose={onClose}
        factura={selectedFactura}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Eliminar Factura"
        message={`¿Estás seguro de eliminar la factura #${facturaToDelete?.nro}?`}
      />
    </Box>
  )
}

export default GestionFacturas
