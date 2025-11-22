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
import UsuarioModal from "../../components/UsuarioModal";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import { API_URL } from "../../config";

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [usuarioToDelete, setUsuarioToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const toast = useToast()

 
  useEffect(() => {
    fetchUsuarios()
    fetchRoles()
  }, [])

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
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        status: 'error',
        duration: 3000,
      })
      setLoading(false)
    }
  }

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
    } catch (error) {
      console.error('Error al cargar roles:', error)
    }
  }

  const handleCreate = () => {
    setSelectedUsuario(null)
    onOpen()
  }

  const handleEdit = (usuario) => {
    setSelectedUsuario(usuario)
    onOpen()
  }

  const handleDelete = (usuario) => {
    setUsuarioToDelete(usuario)
    onDeleteOpen()
  }

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/usuarios/${usuarioToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Usuario eliminado',
          status: 'success',
          duration: 3000,
        })
        fetchUsuarios()
      } else {
        throw new Error('Error al eliminar')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        status: 'error',
        duration: 3000,
      })
    }
    onDeleteClose()
  }

  const handleSave = async (usuarioData) => {
    try {
      const token = localStorage.getItem('token')
      const url = selectedUsuario 
        ? `${API_URL}/usuarios/${selectedUsuario.id}`
        : `${API_URL}/usuarios`
      
      const method = selectedUsuario ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(usuarioData)
      })

      if (response.ok) {
        toast({
          title: selectedUsuario ? 'Usuario actualizado' : 'Usuario creado',
          status: 'success',
          duration: 3000,
        })
        fetchUsuarios()
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

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={handleCreate}>
          Nuevo Usuario
        </Button>
      </HStack>

      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>ID</Th>
              <Th>Username</Th>
              <Th>Email</Th>
              <Th>Rol</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsuarios.length === 0 ? (
              <Tr>
                <Td colSpan={5} textAlign="center" py={8}>
                  <Text color="gray.500">No hay usuarios registrados</Text>
                </Td>
              </Tr>
            ) : (
              filteredUsuarios.map((usuario) => (
                <Tr key={usuario.id} _hover={{ bg: 'gray.50' }}>
                  <Td>{usuario.id}</Td>
                  <Td fontWeight="medium">{usuario.username}</Td>
                  <Td>{usuario.email}</Td>
                  <Td>
                    {usuario.rol ? (
                      <Badge colorScheme="teal">{usuario.rol.nombre}</Badge>
                    ) : (
                      <Badge colorScheme="gray">Sin rol</Badge>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEdit(usuario)}
                        aria-label="Editar usuario"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(usuario)}
                        aria-label="Eliminar usuario"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      <UsuarioModal
        isOpen={isOpen}
        onClose={onClose}
        usuario={selectedUsuario}
        roles={roles}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de eliminar al usuario "${usuarioToDelete?.username}"?`}
      />
    </Box>
  )
}

export default GestionUsuarios
