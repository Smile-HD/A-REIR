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
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon, AddIcon, SearchIcon } from "@chakra-ui/icons";
import EmpleadoModal from "../../components/EmpleadoModal";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import { API_URL } from "../../config";

function GestionEmpleados() {
  const [empleados, setEmpleados] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEmpleado, setSelectedEmpleado] = useState(null)
  const [empleadoToDelete, setEmpleadoToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const toast = useToast()

 
  useEffect(() => {
    fetchEmpleados()
    fetchUsuarios()
  }, [])

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
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los empleados',
        status: 'error',
        duration: 3000,
      })
      setLoading(false)
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

  const handleCreate = () => {
    setSelectedEmpleado(null)
    onOpen()
  }

  const handleEdit = (empleado) => {
    setSelectedEmpleado(empleado)
    onOpen()
  }

  const handleDelete = (empleado) => {
    setEmpleadoToDelete(empleado)
    onDeleteOpen()
  }

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/empleados/${empleadoToDelete.ci}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Empleado eliminado',
          status: 'success',
          duration: 3000,
        })
        fetchEmpleados()
      } else {
        throw new Error('Error al eliminar')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el empleado',
        status: 'error',
        duration: 3000,
      })
    }
    onDeleteClose()
  }

  const handleSave = async (empleadoData) => {
    try {
      const token = localStorage.getItem('token')
      const url = selectedEmpleado 
        ? `${API_URL}/empleados/${selectedEmpleado.ci}`
        : `${API_URL}/empleados`
      
      const method = selectedEmpleado ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(empleadoData)
      })

      if (response.ok) {
        toast({
          title: selectedEmpleado ? 'Empleado actualizado' : 'Empleado creado',
          status: 'success',
          duration: 3000,
        })
        fetchEmpleados()
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

  const filteredEmpleados = empleados.filter(empleado =>
    empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.ci.toString().includes(searchTerm)
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES')
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
      <HStack justify="space-between" mb={6}>
        <InputGroup maxW="300px">
          <InputLeftElement>
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Buscar empleados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={handleCreate}>
          Nuevo Empleado
        </Button>
      </HStack>

      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>CI</Th>
              <Th>Nombre Completo</Th>
              <Th>Teléfono</Th>
              <Th>Dirección</Th>
              <Th>Fecha Nacimiento</Th>
              <Th>Usuario Asignado</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredEmpleados.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py={8}>
                  <Text color="gray.500">No hay empleados registrados</Text>
                </Td>
              </Tr>
            ) : (
              filteredEmpleados.map((empleado) => (
                <Tr key={empleado.ci} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="medium">{empleado.ci}</Td>
                  <Td>{empleado.nombre} {empleado.apellidos}</Td>
                  <Td>{empleado.telefono}</Td>
                  <Td maxW="200px" isTruncated>{empleado.direccion}</Td>
                  <Td>{formatDate(empleado.fechaNac)}</Td>
                  <Td>
                    {empleado.usuario ? (
                      <Badge colorScheme="green">
                        {empleado.usuario.username}
                      </Badge>
                    ) : (
                      <Badge colorScheme="gray">Sin usuario</Badge>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEdit(empleado)}
                        aria-label="Editar empleado"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(empleado)}
                        aria-label="Eliminar empleado"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      <EmpleadoModal
        isOpen={isOpen}
        onClose={onClose}
        empleado={selectedEmpleado}
        usuarios={usuarios}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Eliminar Empleado"
        message={`¿Estás seguro de eliminar al empleado ${empleadoToDelete?.nombre} ${empleadoToDelete?.apellidos} (CI: ${empleadoToDelete?.ci})?`}
      />
    </Box>
  )
}

export default GestionEmpleados
