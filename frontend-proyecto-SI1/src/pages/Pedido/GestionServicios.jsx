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
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon, AddIcon, SearchIcon } from "@chakra-ui/icons";
import ServicioModal from "../../components/ServicioModal";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import { API_URL } from "../../config";

function GestionServicios() {
  const [servicios, setServicios] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedServicio, setSelectedServicio] = useState(null)
  const [servicioToDelete, setServicioToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const toast = useToast()


  useEffect(() => {
    fetchServicios()
    fetchCategorias()
  }, [])

  const fetchServicios = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/servicios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setServicios(data.servicios || [])
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los servicios',
        status: 'error',
        duration: 3000,
      })
      setLoading(false)
    }
  }

  const fetchCategorias = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/categorias`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setCategorias(data.categorias || [])
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    }
  }

  const handleCreate = () => {
    setSelectedServicio(null)
    onOpen()
  }

  const handleEdit = (servicio) => {
    setSelectedServicio(servicio)
    onOpen()
  }

  const handleDelete = (servicio) => {
    setServicioToDelete(servicio)
    onDeleteOpen()
  }

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/servicios/${servicioToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Servicio eliminado',
          status: 'success',
          duration: 3000,
        })
        fetchServicios()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'No se pudo eliminar el servicio',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el servicio',
        status: 'error',
        duration: 3000,
      })
    }
    onDeleteClose()
  }

  const handleSave = async (servicioData) => {
    try {
      const token = localStorage.getItem('token')
      const url = selectedServicio 
        ? `${API_URL}/servicios/${selectedServicio.id}`
        : `${API_URL}/servicios`
      
      const method = selectedServicio ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(servicioData)
      })

      if (response.ok) {
        toast({
          title: selectedServicio ? 'Servicio actualizado' : 'Servicio creado',
          status: 'success',
          duration: 3000,
        })
        fetchServicios()
        fetchCategorias() // Recargar categorías por si se creó una nueva
        onClose()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'No se pudo guardar el servicio',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el servicio',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const filteredServicios = servicios.filter(servicio =>
    servicio.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servicio.categoria?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servicio.id.toString().includes(searchTerm)
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
            <Heading size="lg">Gestión de Servicios</Heading>
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleCreate}>
              Nuevo Servicio
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          <InputGroup mb={4} maxW="400px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por ID, descripción o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {filteredServicios.length === 0 ? (
            <Text>No hay servicios registrados</Text>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Descripción</Th>
                    <Th>Categoría</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredServicios.map((servicio) => (
                    <Tr key={servicio.id}>
                      <Td>{servicio.id}</Td>
                      <Td>{servicio.descripcion}</Td>
                      <Td>
                        <Badge colorScheme="purple">
                          {servicio.categoria?.nombre || 'Sin categoría'}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Editar servicio"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEdit(servicio)}
                          />
                          <IconButton
                            aria-label="Eliminar servicio"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDelete(servicio)}
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
            Total de servicios: {filteredServicios.length}
          </Text>
        </CardBody>
      </Card>

      <ServicioModal
        isOpen={isOpen}
        onClose={onClose}
        servicio={selectedServicio}
        categorias={categorias}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Eliminar Servicio"
        message={`¿Está seguro de que desea eliminar el servicio "${servicioToDelete?.descripcion}"?`}
      />
    </Box>
  )
}

export default GestionServicios
