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
  VStack,
  Collapse,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon, AddIcon, SearchIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { FaCheckCircle } from "react-icons/fa";
import DiagnosticoModal from "../../components/DiagnosticoModal";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import { API_URL } from "../../config";

function GestionDiagnosticos() {
  const [diagnosticos, setDiagnosticos] = useState([])
  const [motos, setMotos] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDiagnostico, setSelectedDiagnostico] = useState(null)
  const [diagnosticoToDelete, setDiagnosticoToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRows, setExpandedRows] = useState(new Set())
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const toast = useToast()

 
  useEffect(() => {
    fetchDiagnosticos()
    fetchMotos()
    fetchEmpleados()
  }, [])

  const fetchDiagnosticos = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/diagnosticos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setDiagnosticos(data.diagnosticos || [])
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los diagnósticos',
        status: 'error',
        duration: 3000,
      })
      setLoading(false)
    }
  }

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
    } catch (error) {
      console.error('Error al cargar motos:', error)
    }
  }

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
    } catch (error) {
      console.error('Error al cargar empleados:', error)
    }
  }

  const handleCreate = () => {
    setSelectedDiagnostico(null)
    onOpen()
  }

  const handleEdit = (diagnostico) => {
    setSelectedDiagnostico(diagnostico)
    onOpen()
  }

  const handleDelete = (diagnostico) => {
    setDiagnosticoToDelete(diagnostico)
    onDeleteOpen()
  }

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/diagnosticos/${diagnosticoToDelete.nro}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Diagnóstico eliminado',
          status: 'success',
          duration: 3000,
        })
        fetchDiagnosticos()
      } else {
        throw new Error('Error al eliminar')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el diagnóstico',
        status: 'error',
        duration: 3000,
      })
    }
    onDeleteClose()
  }

  const handleSave = async (diagnosticoData) => {
    try {
      const token = localStorage.getItem('token')
      const url = selectedDiagnostico 
        ? `${API_URL}/diagnosticos/${selectedDiagnostico.nro}`
        : `${API_URL}/diagnosticos`
      
      const method = selectedDiagnostico ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(diagnosticoData)
      })

      if (response.ok) {
        toast({
          title: selectedDiagnostico ? 'Diagnóstico actualizado' : 'Diagnóstico creado',
          status: 'success',
          duration: 3000,
        })
        fetchDiagnosticos()
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

  const toggleRowExpansion = (nro) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(nro)) {
      newExpanded.delete(nro)
    } else {
      newExpanded.add(nro)
    }
    setExpandedRows(newExpanded)
  }

  const filteredDiagnosticos = diagnosticos.filter(diag =>
    diag.moto.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diag.moto.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${diag.empleado.nombre} ${diag.empleado.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES')
  }

  const formatTime = (timeString) => {
    const time = new Date(timeString)
    return time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
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
            placeholder="Buscar diagnósticos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={handleCreate}>
          Nuevo Diagnóstico
        </Button>
      </HStack>

      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>NRO</Th>
              <Th>Fecha</Th>
              <Th>Hora</Th>
              <Th>Moto</Th>
              <Th>Empleado</Th>
              <Th>Detalles</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredDiagnosticos.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py={8}>
                  <Text color="gray.500">No hay diagnósticos registrados</Text>
                </Td>
              </Tr>
            ) : (
              filteredDiagnosticos.map((diagnostico) => (
                <>
                  <Tr key={diagnostico.nro} _hover={{ bg: 'gray.50' }}>
                    <Td fontWeight="medium">{diagnostico.nro.toString()}</Td>
                    <Td>{formatDate(diagnostico.fecha)}</Td>
                    <Td>{formatTime(diagnostico.hora)}</Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{diagnostico.moto.placa}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {diagnostico.moto.marca.nombre} {diagnostico.moto.modelo}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {diagnostico.empleado.nombre} {diagnostico.empleado.apellidos}
                      </Text>
                    </Td>
                    <Td>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        rightIcon={expandedRows.has(diagnostico.nro) ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        onClick={() => toggleRowExpansion(diagnostico.nro)}
                      >
                        {diagnostico.detalles?.length || 0} detalle(s)
                      </Button>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => handleEdit(diagnostico)}
                          aria-label="Editar diagnóstico"
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDelete(diagnostico)}
                          aria-label="Eliminar diagnóstico"
                        />
                      </HStack>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td colSpan={7} p={0} border="none">
                      <Collapse in={expandedRows.has(diagnostico.nro)} animateOpacity>
                        <Box bg="blue.50" p={4} borderTop="1px" borderColor="blue.100">
                          <Text fontWeight="bold" mb={2} color="blue.700">
                            Detalles del diagnóstico:
                          </Text>
                          <List spacing={2}>
                            {diagnostico.detalles?.map((detalle, index) => (
                              <ListItem key={detalle.id} display="flex" alignItems="start">
                                <ListIcon as={FaCheckCircle} color="blue.500" mt={1} />
                                <Text flex={1}>{detalle.descripcion}</Text>
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Collapse>
                    </Td>
                  </Tr>
                </>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      <DiagnosticoModal
        isOpen={isOpen}
        onClose={onClose}
        diagnostico={selectedDiagnostico}
        motos={motos}
        empleados={empleados}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Eliminar Diagnóstico"
        message={`¿Estás seguro de eliminar el diagnóstico #${diagnosticoToDelete?.nro}? Esto también eliminará todos sus detalles.`}
      />
    </Box>
  )
}

export default GestionDiagnosticos
