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
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Badge,
  Tooltip,
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon, AddIcon, SearchIcon, ViewIcon } from '@chakra-ui/icons'
import ProformaModal from '../../components/ProformaModal'
import ProformaDetalleModal from '../../components/ProformaDetalleModal'
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog'
import { API_URL } from '../../config'

function GestionProformas() {
  const [proformas, setProformas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProforma, setSelectedProforma] = useState(null)
  const [proformaToDelete, setProformaToDelete] = useState(null)
  const [proformaToView, setProformaToView] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
  const toast = useToast()

 
  useEffect(() => {
    fetchProformas()
  }, [])

  const fetchProformas = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/proformas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setProformas(data.proformas || [])
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las proformas',
        status: 'error',
        duration: 3000,
      })
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedProforma(null)
    onOpen()
  }

  const handleEdit = (proforma) => {
    setSelectedProforma(proforma)
    onOpen()
  }

  const handleDelete = (proforma) => {
    setProformaToDelete(proforma)
    onDeleteOpen()
  }

  const handleView = async (proforma) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/proformas/${proforma.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setProformaToView(data)
      onViewOpen()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el detalle de la proforma',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/proformas/${proformaToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Proforma eliminada',
          status: 'success',
          duration: 3000,
        })
        fetchProformas()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'No se pudo eliminar la proforma',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la proforma',
        status: 'error',
        duration: 3000,
      })
    }
    onDeleteClose()
  }

  const handleSave = async (proformaData) => {
    try {
      const token = localStorage.getItem('token')
      const url = selectedProforma 
        ? `${API_URL}/proformas/${selectedProforma.id}`
        : `${API_URL}/proformas`
      
      const method = selectedProforma ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(proformaData)
      })

      if (response.ok) {
        toast({
          title: selectedProforma ? 'Proforma actualizada' : 'Proforma creada',
          status: 'success',
          duration: 3000,
        })
        fetchProformas()
        onClose()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'No se pudo guardar la proforma',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la proforma',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const getEstadoBadge = (estado) => {
    const colores = {
      PENDIENTE: 'yellow',
      APROBADA: 'green',
      RECHAZADA: 'red',
      COMPLETADA: 'blue'
    }
    return <Badge colorScheme={colores[estado] || 'gray'}>{estado}</Badge>
  }

  const filteredProformas = proformas.filter(proforma =>
    proforma.id.toString().includes(searchTerm) ||
    proforma.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proforma.cliente?.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proforma.estado.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    )
  }

  return (
    <Box p={8}>
      <Card>
        <CardHeader>
          <HStack justifyContent="space-between">
            <Heading size="lg">Gestión de Proformas</Heading>
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleCreate}>
              Nueva Proforma
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          <InputGroup mb={4} maxW="400px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por ID, cliente o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {filteredProformas.length === 0 ? (
            <Text>No hay proformas registradas</Text>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Fecha</Th>
                    <Th>Cliente</Th>
                    <Th>Estado</Th>
                    <Th isNumeric>Total (Bs.)</Th>
                    <Th textAlign="center">Detalles</Th>
                    <Th textAlign="center">Repuestos</Th>
                    <Th>Diagnóstico</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredProformas.map((proforma) => (
                    <Tr key={proforma.id}>
                      <Td>{proforma.id}</Td>
                      <Td>{new Date(proforma.fecha).toLocaleDateString()}</Td>
                      <Td>{`${proforma.cliente?.nombre} ${proforma.cliente?.apellidos}`}</Td>
                      <Td>{getEstadoBadge(proforma.estado)}</Td>
                      <Td isNumeric fontWeight="bold">{parseFloat(proforma.total).toFixed(2)}</Td>
                      <Td textAlign="center">
                        <Badge colorScheme="purple">{proforma._count?.detalles || 0}</Badge>
                      </Td>
                      <Td textAlign="center">
                        <Badge colorScheme="orange">{proforma._count?.repuestos || 0}</Badge>
                      </Td>
                      <Td>
                        {proforma.diagnostico ? (
                          <Tooltip label={`Moto: ${proforma.diagnostico.moto?.placa}`}>
                            <Badge colorScheme="teal">#{proforma.diagnostico.nro}</Badge>
                          </Tooltip>
                        ) : (
                          <Text fontSize="sm" color="gray.500">Sin diagnóstico</Text>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="Ver detalles completos">
                            <IconButton
                              aria-label="Ver proforma"
                              icon={<ViewIcon />}
                              size="sm"
                              colorScheme="purple"
                              onClick={() => handleView(proforma)}
                            />
                          </Tooltip>
                          <IconButton
                            aria-label="Editar proforma"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEdit(proforma)}
                          />
                          <IconButton
                            aria-label="Eliminar proforma"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDelete(proforma)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          <Text mt={4} fontSize="sm" color="gray.600">
            Total de proformas: {filteredProformas.length}
          </Text>
        </CardBody>
      </Card>

      <ProformaModal
        isOpen={isOpen}
        onClose={onClose}
        proforma={selectedProforma}
        onSave={handleSave}
      />

      <ProformaDetalleModal
        isOpen={isViewOpen}
        onClose={onViewClose}
        proforma={proformaToView}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Eliminar Proforma"
        message={`¿Está seguro de que desea eliminar la proforma #${proformaToDelete?.id}?`}
      />
    </Box>
  )
}

export default GestionProformas
