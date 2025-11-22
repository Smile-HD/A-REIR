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
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon, AddIcon, SearchIcon } from "@chakra-ui/icons";
import { usePermissions } from "../../contexts/PermissionContext";
import ClienteModal from "../../components/ClienteModal";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import { API_URL } from "../../config";

function GestionClientes() {
  const { hasPermission } = usePermissions();
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [clienteToDelete, setClienteToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const toast = useToast()

 
  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/clientes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setClientes(data.clientes || [])
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los clientes',
        status: 'error',
        duration: 3000,
      })
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedCliente(null)
    onOpen()
  }

  const handleEdit = (cliente) => {
    setSelectedCliente(cliente)
    onOpen()
  }

  const handleDelete = (cliente) => {
    setClienteToDelete(cliente)
    onDeleteOpen()
  }

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/clientes/${clienteToDelete.ci}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Cliente eliminado',
          status: 'success',
          duration: 3000,
        })
        fetchClientes()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'No se pudo eliminar el cliente',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el cliente',
        status: 'error',
        duration: 3000,
      })
    }
    onDeleteClose()
  }

  const handleSave = async (clienteData) => {
    try {
      const token = localStorage.getItem('token')
      const url = selectedCliente 
        ? `${API_URL}/clientes/${selectedCliente.ci}`
        : `${API_URL}/clientes`
      
      const method = selectedCliente ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(clienteData)
      })

      if (response.ok) {
        toast({
          title: selectedCliente ? 'Cliente actualizado' : 'Cliente creado',
          status: 'success',
          duration: 3000,
        })
        fetchClientes()
        onClose()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'No se pudo guardar el cliente',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el cliente',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.ci.toString().includes(searchTerm) ||
    cliente.telefono.includes(searchTerm)
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
            <Heading size="lg">Gestión de Clientes</Heading>
            {hasPermission('clientes:crear') && (
              <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleCreate}>
                Nuevo Cliente
              </Button>
            )}
          </HStack>
        </CardHeader>
        <CardBody>
          <InputGroup mb={4} maxW="400px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por CI, nombre, apellido o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {filteredClientes.length === 0 ? (
            <Text>No hay clientes registrados</Text>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>CI</Th>
                    <Th>Nombre</Th>
                    <Th>Apellidos</Th>
                    <Th>Teléfono</Th>
                    <Th>Dirección</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredClientes.map((cliente) => (
                    <Tr key={cliente.ci}>
                      <Td>{cliente.ci}</Td>
                      <Td>{cliente.nombre}</Td>
                      <Td>{cliente.apellidos}</Td>
                      <Td>{cliente.telefono}</Td>
                      <Td>{cliente.direccion}</Td>
                      <Td>
                        <HStack spacing={2}>
                          {hasPermission('clientes:editar') && (
                            <IconButton
                              aria-label="Editar cliente"
                              icon={<EditIcon />}
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleEdit(cliente)}
                            />
                          )}
                          {hasPermission('clientes:eliminar') && (
                            <IconButton
                              aria-label="Eliminar cliente"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDelete(cliente)}
                            />
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          <Text mt={4} fontSize="sm" color="gray.600">
            Total de clientes: {filteredClientes.length}
          </Text>
        </CardBody>
      </Card>

      <ClienteModal
        isOpen={isOpen}
        onClose={onClose}
        cliente={selectedCliente}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Eliminar Cliente"
        message={`¿Está seguro de que desea eliminar al cliente ${clienteToDelete?.nombre} ${clienteToDelete?.apellidos}?`}
      />
    </Box>
  )
}

export default GestionClientes
