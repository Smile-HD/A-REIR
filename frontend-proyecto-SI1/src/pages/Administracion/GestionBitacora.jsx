import { useState, useEffect } from 'react'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  Badge,
  useToast,
  VStack,
  Flex,
  IconButton,
} from '@chakra-ui/react'
import { SearchIcon, DownloadIcon, RepeatIcon } from '@chakra-ui/icons'
import { API_URL } from '../../config'

function GestionBitacora() {
  const [bitacora, setBitacora] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [usuarioFiltro, setUsuarioFiltro] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const toast = useToast()

  

  useEffect(() => {
    fetchBitacora()
  }, [pagina, busqueda, usuarioFiltro, fechaInicio, fechaFin])

  const fetchBitacora = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const params = new URLSearchParams({
        pagina: pagina.toString(),
        limite: '50'
      })
      
      if (busqueda) params.append('busqueda', busqueda)
      if (usuarioFiltro) params.append('usuarioId', usuarioFiltro)
      if (fechaInicio) params.append('fechaInicio', fechaInicio)
      if (fechaFin) params.append('fechaFin', fechaFin)

      const response = await fetch(`${API_URL}/bitacora?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBitacora(data.registros || [])
        setTotalPaginas(data.totalPaginas || 1)
      } else {
        throw new Error('Error al cargar bitácora')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportar = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      
      if (fechaInicio) params.append('fechaInicio', fechaInicio)
      if (fechaFin) params.append('fechaFin', fechaFin)

      const response = await fetch(`${API_URL}/bitacora/exportar?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bitacora_${Date.now()}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: 'Exportado',
          description: 'Bitácora exportada exitosamente',
          status: 'success',
          duration: 3000,
        })
      } else {
        throw new Error('Error al exportar')
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

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getTipoBadge = (descripcion) => {
    if (descripcion.includes('Creó')) return { color: 'green', text: 'Crear' }
    if (descripcion.includes('Editó') || descripcion.includes('Actualizó')) return { color: 'orange', text: 'Editar' }
    if (descripcion.includes('Eliminó')) return { color: 'red', text: 'Eliminar' }
    if (descripcion.includes('Inicio de sesión')) return { color: 'blue', text: 'Login' }
    if (descripcion.includes('Cierre de sesión')) return { color: 'purple', text: 'Logout' }
    return { color: 'gray', text: 'Otro' }
  }

  if (loading && bitacora.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="purple.500" />
      </Box>
    )
  }

  return (
    <Box>
      <VStack spacing={4} mb={6} align="stretch">
        <HStack spacing={4}>
          <InputGroup maxW="400px">
            <InputLeftElement>
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar en descripciones..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPagina(1)
              }}
            />
          </InputGroup>

          <Input
            type="date"
            placeholder="Fecha inicio"
            value={fechaInicio}
            onChange={(e) => {
              setFechaInicio(e.target.value)
              setPagina(1)
            }}
            maxW="200px"
          />

          <Input
            type="date"
            placeholder="Fecha fin"
            value={fechaFin}
            onChange={(e) => {
              setFechaFin(e.target.value)
              setPagina(1)
            }}
            maxW="200px"
          />

          <IconButton
            icon={<RepeatIcon />}
            onClick={fetchBitacora}
            aria-label="Refrescar"
            colorScheme="blue"
          />

          <Button
            leftIcon={<DownloadIcon />}
            colorScheme="green"
            onClick={handleExportar}
          >
            Exportar CSV
          </Button>
        </HStack>
      </VStack>

      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>ID</Th>
              <Th>Tipo</Th>
              <Th>Usuario</Th>
              <Th>Descripción</Th>
              <Th>Fecha/Hora</Th>
              <Th>IP</Th>
            </Tr>
          </Thead>
          <Tbody>
            {bitacora.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" py={8}>
                  <Text color="gray.500">No hay registros en la bitácora</Text>
                </Td>
              </Tr>
            ) : (
              bitacora.map((registro) => {
                const tipoBadge = getTipoBadge(registro.descripcion)
                return (
                  <Tr key={registro.id} _hover={{ bg: 'gray.50' }}>
                    <Td fontSize="sm">{registro.id.toString()}</Td>
                    <Td>
                      <Badge colorScheme={tipoBadge.color}>
                        {tipoBadge.text}
                      </Badge>
                    </Td>
                    <Td fontWeight="medium">{registro.usuario?.username || 'N/A'}</Td>
                    <Td maxW="400px" fontSize="sm" isTruncated>
                      {registro.descripcion}
                    </Td>
                    <Td fontSize="sm">{formatFecha(registro.fechaHora)}</Td>
                    <Td fontSize="sm">{registro.ipOrigen || 'N/A'}</Td>
                  </Tr>
                )
              })
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Paginación */}
      <Flex justify="center" mt={6} gap={2}>
        <Button
          size="sm"
          onClick={() => setPagina(p => Math.max(1, p - 1))}
          isDisabled={pagina === 1}
        >
          Anterior
        </Button>
        <Text alignSelf="center" px={4}>
          Página {pagina} de {totalPaginas}
        </Text>
        <Button
          size="sm"
          onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
          isDisabled={pagina === totalPaginas}
        >
          Siguiente
        </Button>
      </Flex>
    </Box>
  )
}

export default GestionBitacora
