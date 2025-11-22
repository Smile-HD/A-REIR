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
import MotoModal from "../../components/MotoModal";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import { API_URL } from "../../config";

function GestionMotos() {
  const [motos, setMotos] = useState([])
  const [marcas, setMarcas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMoto, setSelectedMoto] = useState(null)
  const [motoToDelete, setMotoToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const toast = useToast()

 
  useEffect(() => {
    fetchMotos()
    fetchMarcas()
  }, [])

  const fetchMotos = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/motos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setMotos(data.motos || [])
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las motos',
        status: 'error',
        duration: 3000,
      })
      setLoading(false)
    }
  }

  const fetchMarcas = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/motos/marcas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setMarcas(data.marcas || [])
    } catch (error) {
      console.error('Error al cargar marcas:', error)
    }
  }

  const handleCreate = () => {
    setSelectedMoto(null)
    onOpen()
  }

  const handleEdit = (moto) => {
    setSelectedMoto(moto)
    onOpen()
  }

  const handleDelete = (moto) => {
    setMotoToDelete(moto)
    onDeleteOpen()
  }

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/motos/${motoToDelete.placa}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Moto eliminada',
          status: 'success',
          duration: 3000,
        })
        fetchMotos()
      } else {
        throw new Error('Error al eliminar')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la moto',
        status: 'error',
        duration: 3000,
      })
    }
    onDeleteClose()
  }

  const handleSave = async (motoData) => {
    try {
      const token = localStorage.getItem('token')
      const url = selectedMoto 
        ? `${API_URL}/motos/${selectedMoto.placa}`
        : `${API_URL}/motos`
      
      const method = selectedMoto ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(motoData)
      })

      if (response.ok) {
        toast({
          title: selectedMoto ? 'Moto actualizada' : 'Moto creada',
          status: 'success',
          duration: 3000,
        })
        fetchMotos()
        fetchMarcas() // Actualizar marcas por si se creó una nueva
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

  const filteredMotos = motos.filter(moto =>
    moto.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moto.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moto.marca.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (moto.chasis && moto.chasis.toLowerCase().includes(searchTerm.toLowerCase()))
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
            placeholder="Buscar motos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={handleCreate}>
          Nueva Moto
        </Button>
      </HStack>

      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Placa</Th>
              <Th>Marca</Th>
              <Th>Modelo</Th>
              <Th>Año</Th>
              <Th>Chasis</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredMotos.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" py={8}>
                  <Text color="gray.500">No hay motos registradas</Text>
                </Td>
              </Tr>
            ) : (
              filteredMotos.map((moto) => (
                <Tr key={moto.placa} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="medium">{moto.placa}</Td>
                  <Td>
                    <Badge colorScheme="blue">
                      {moto.marca.nombre}
                    </Badge>
                  </Td>
                  <Td>{moto.modelo}</Td>
                  <Td>{moto.anio}</Td>
                  <Td>
                    {moto.chasis ? (
                      <Text fontSize="sm" fontFamily="mono">{moto.chasis}</Text>
                    ) : (
                      <Badge colorScheme="gray">Sin chasis</Badge>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEdit(moto)}
                        aria-label="Editar moto"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(moto)}
                        aria-label="Eliminar moto"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      <MotoModal
        isOpen={isOpen}
        onClose={onClose}
        moto={selectedMoto}
        marcas={marcas}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Eliminar Moto"
        message={`¿Estás seguro de eliminar la moto con placa ${motoToDelete?.placa}?`}
      />
    </Box>
  )
}

export default GestionMotos
