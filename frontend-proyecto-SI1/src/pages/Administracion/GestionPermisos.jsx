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
import PermisoModal from "../../components/PermisoModal";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import { API_URL } from "../../config";

function GestionPermisos() {
  const [permisos, setPermisos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPermiso, setSelectedPermiso] = useState(null)
  const [permisoToDelete, setPermisoToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const toast = useToast()

 
  useEffect(() => {
    fetchPermisos()
  }, [])

  const fetchPermisos = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/permisos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setPermisos(data.permisos || [])
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los permisos',
        status: 'error',
        duration: 3000,
      })
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedPermiso(null)
    onOpen()
  }

  const handleEdit = (permiso) => {
    setSelectedPermiso(permiso)
    onOpen()
  }

  const handleDelete = (permiso) => {
    setPermisoToDelete(permiso)
    onDeleteOpen()
  }

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/permisos/${permisoToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Permiso eliminado',
          status: 'success',
          duration: 3000,
        })
        fetchPermisos()
      } else {
        throw new Error('Error al eliminar')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el permiso',
        status: 'error',
        duration: 3000,
      })
    }
    onDeleteClose()
  }

  const handleSave = async (permisoData) => {
    try {
      const token = localStorage.getItem('token')
      const url = selectedPermiso 
        ? `${API_URL}/permisos/${selectedPermiso.id}`
        : `${API_URL}/permisos`
      
      const method = selectedPermiso ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(permisoData)
      })

      if (response.ok) {
        toast({
          title: selectedPermiso ? 'Permiso actualizado' : 'Permiso creado',
          status: 'success',
          duration: 3000,
        })
        fetchPermisos()
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

  const filteredPermisos = permisos.filter(permiso =>
    permiso.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            placeholder="Buscar permisos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={handleCreate}>
          Nuevo Permiso
        </Button>
      </HStack>

      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>ID</Th>
              <Th>Nombre</Th>
              <Th>Roles Asignados</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPermisos.length === 0 ? (
              <Tr>
                <Td colSpan={4} textAlign="center" py={8}>
                  <Text color="gray.500">No hay permisos registrados</Text>
                </Td>
              </Tr>
            ) : (
              filteredPermisos.map((permiso) => (
                <Tr key={permiso.id} _hover={{ bg: 'gray.50' }}>
                  <Td>{permiso.id}</Td>
                  <Td fontWeight="medium">{permiso.nombre}</Td>
                  <Td>
                    <Badge colorScheme="purple">
                      {permiso._count?.roles || 0} roles
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEdit(permiso)}
                        aria-label="Editar permiso"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(permiso)}
                        aria-label="Eliminar permiso"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      <PermisoModal
        isOpen={isOpen}
        onClose={onClose}
        permiso={selectedPermiso}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Eliminar Permiso"
        message={`¿Estás seguro de eliminar el permiso "${permisoToDelete?.nombre}"?`}
      />
    </Box>
  )
}

export default GestionPermisos
