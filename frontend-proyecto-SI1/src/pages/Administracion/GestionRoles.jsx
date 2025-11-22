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
import { EditIcon, DeleteIcon, AddIcon, SearchIcon, LockIcon } from "@chakra-ui/icons";
import RolModal from "../../components/RolModal";
import PermisosRolModal from "../../components/PermisosRolModal";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import { API_URL } from "../../config";

function GestionRoles() {
  const [roles, setRoles] = useState([])
  const [permisos, setPermisos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRol, setSelectedRol] = useState(null)
  const [rolToDelete, setRolToDelete] = useState(null)
  const [rolForPermisos, setRolForPermisos] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isPermisosOpen, onOpen: onPermisosOpen, onClose: onPermisosClose } = useDisclosure()
  const toast = useToast()


  useEffect(() => {
    fetchRoles()
    fetchPermisos()
  }, [])

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setRoles(data.roles || [])
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los roles',
        status: 'error',
        duration: 3000,
      })
      setLoading(false)
    }
  }

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
    } catch (error) {
      console.error('Error al cargar permisos:', error)
    }
  }

  const handleCreate = () => {
    setSelectedRol(null)
    onOpen()
  }

  const handleEdit = (rol) => {
    setSelectedRol(rol)
    onOpen()
  }

  const handleDelete = (rol) => {
    setRolToDelete(rol)
    onDeleteOpen()
  }

  const handleManagePermisos = (rol) => {
    setRolForPermisos(rol)
    onPermisosOpen()
  }

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/roles/${rolToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Rol eliminado',
          status: 'success',
          duration: 3000,
        })
        fetchRoles()
      } else {
        throw new Error('Error al eliminar')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el rol',
        status: 'error',
        duration: 3000,
      })
    }
    onDeleteClose()
  }

  const handleSave = async (rolData) => {
    try {
      const token = localStorage.getItem('token')
      const url = selectedRol 
        ? `${API_URL}/roles/${selectedRol.id}`
        : `${API_URL}/roles`
      
      const method = selectedRol ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(rolData)
      })

      if (response.ok) {
        toast({
          title: selectedRol ? 'Rol actualizado' : 'Rol creado',
          status: 'success',
          duration: 3000,
        })
        fetchRoles()
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

  const handleSavePermisos = async (permisosIds) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/roles/${rolForPermisos.id}/permisos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ permisos: permisosIds })
      })

      if (response.ok) {
        toast({
          title: 'Permisos actualizados',
          status: 'success',
          duration: 3000,
        })
        fetchRoles()
        onPermisosClose()
      } else {
        throw new Error('Error al actualizar permisos')
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

  const filteredRoles = roles.filter(rol =>
    rol.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Buscar roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={handleCreate}>
          Nuevo Rol
        </Button>
      </HStack>

      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>ID</Th>
              <Th>Nombre</Th>
              <Th>Permisos</Th>
              <Th>Usuarios</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredRoles.length === 0 ? (
              <Tr>
                <Td colSpan={5} textAlign="center" py={8}>
                  <Text color="gray.500">No hay roles registrados</Text>
                </Td>
              </Tr>
            ) : (
              filteredRoles.map((rol) => (
                <Tr key={rol.id} _hover={{ bg: 'gray.50' }}>
                  <Td>{rol.id}</Td>
                  <Td fontWeight="medium">{rol.nombre}</Td>
                  <Td>
                    <HStack spacing={1} flexWrap="wrap">
                      {rol.permisos && rol.permisos.length > 0 ? (
                        rol.permisos.slice(0, 3).map((rp) => (
                          <Badge key={rp.permiso.id} colorScheme="purple" fontSize="xs">
                            {rp.permiso.nombre}
                          </Badge>
                        ))
                      ) : (
                        <Badge colorScheme="gray">Sin permisos</Badge>
                      )}
                      {rol.permisos && rol.permisos.length > 3 && (
                        <Badge colorScheme="gray" fontSize="xs">
                          +{rol.permisos.length - 3}
                        </Badge>
                      )}
                    </HStack>
                  </Td>
                  <Td>
                    <Badge colorScheme="blue">
                      {rol._count?.usuarios || 0} usuarios
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<LockIcon />}
                        size="sm"
                        colorScheme="purple"
                        variant="ghost"
                        onClick={() => handleManagePermisos(rol)}
                        aria-label="Gestionar permisos"
                        title="Gestionar permisos"
                      />
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEdit(rol)}
                        aria-label="Editar rol"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(rol)}
                        aria-label="Eliminar rol"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      <RolModal
        isOpen={isOpen}
        onClose={onClose}
        rol={selectedRol}
        onSave={handleSave}
      />

      <PermisosRolModal
        isOpen={isPermisosOpen}
        onClose={onPermisosClose}
        rol={rolForPermisos}
        permisos={permisos}
        onSave={handleSavePermisos}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Eliminar Rol"
        message={`¿Estás seguro de eliminar el rol "${rolToDelete?.nombre}"?`}
      />
    </Box>
  )
}

export default GestionRoles
