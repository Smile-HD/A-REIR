import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  FormErrorMessage,
  Select,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Text,
  Box,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react'
import { API_URL } from '../config'
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'

function ProformaModal({ isOpen, onClose, proforma, onSave }) {
  const [formData, setFormData] = useState({
    fecha: '',
    clienteCi: '',
    diagnosticoId: '',
    estado: 'PENDIENTE'
  })
  const [detalles, setDetalles] = useState([{
    id: 1,
    servicioId: '',
    descripcion: '',
    cantidad: '1',
    precioUnit: '0'
  }])
  const [repuestos, setRepuestos] = useState([])
  const [clientes, setClientes] = useState([])
  const [servicios, setServicios] = useState([])
  const [diagnosticos, setDiagnosticos] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [nextDetalleId, setNextDetalleId] = useState(2)
  const [nextRepuestoId, setNextRepuestoId] = useState(1)
 

  useEffect(() => {
    if (isOpen) {
      fetchClientes()
      fetchServicios()
      fetchDiagnosticos()
    }
  }, [isOpen])

  useEffect(() => {
    if (proforma) {
      setFormData({
        fecha: proforma.fecha ? new Date(proforma.fecha).toISOString().split('T')[0] : '',
        clienteCi: proforma.clienteCi || '',
        diagnosticoId: proforma.diagnosticoId || '',
        estado: proforma.estado || 'PENDIENTE'
      })
      
      // Cargar detalles existentes
      if (proforma.detalles && proforma.detalles.length > 0) {
        const detallesCargados = proforma.detalles.map((detalle, index) => ({
          id: index + 1,
          servicioId: detalle.servicioId || '',
          descripcion: detalle.descripcion || '',
          cantidad: detalle.cantidad?.toString() || '1',
          precioUnit: detalle.precioUnit?.toString() || '0'
        }))
        setDetalles(detallesCargados)
        setNextDetalleId(detallesCargados.length + 1)
      } else {
        setDetalles([{
          id: 1,
          servicioId: '',
          descripcion: '',
          cantidad: '1',
          precioUnit: '0'
        }])
        setNextDetalleId(2)
      }

      // Cargar repuestos existentes
      if (proforma.repuestos && proforma.repuestos.length > 0) {
        const repuestosCargados = proforma.repuestos.map((repuesto, index) => ({
          id: index + 1,
          nombre: repuesto.nombre || ''
        }))
        setRepuestos(repuestosCargados)
        setNextRepuestoId(repuestosCargados.length + 1)
      } else {
        setRepuestos([])
        setNextRepuestoId(1)
      }
    } else {
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        clienteCi: '',
        diagnosticoId: '',
        estado: 'PENDIENTE'
      })
      setDetalles([{
        id: 1,
        servicioId: '',
        descripcion: '',
        cantidad: '1',
        precioUnit: '0'
      }])
      setRepuestos([])
      setNextDetalleId(2)
      setNextRepuestoId(1)
    }
    setErrors({})
  }, [proforma, isOpen])

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/clientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setClientes(data.clientes || [])
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    }
  }

  const fetchServicios = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/servicios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setServicios(data.servicios || [])
    } catch (error) {
      console.error('Error al cargar servicios:', error)
    }
  }

  const fetchDiagnosticos = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/diagnosticos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setDiagnosticos(data.diagnosticos || [])
    } catch (error) {
      console.error('Error al cargar diagnósticos:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleDetalleChange = (id, field, value) => {
    setDetalles(prev => prev.map(det => 
      det.id === id ? { ...det, [field]: value } : det
    ))
  }

  const handleServicioChange = (id, servicioId) => {
    const servicio = servicios.find(s => s.id === parseInt(servicioId))
    setDetalles(prev => prev.map(det => {
      if (det.id === id) {
        return {
          ...det,
          servicioId: servicioId,
          descripcion: servicio ? servicio.descripcion : det.descripcion
        }
      }
      return det
    }))
  }

  const agregarDetalle = () => {
    setDetalles(prev => [...prev, {
      id: nextDetalleId,
      servicioId: '',
      descripcion: '',
      cantidad: '1',
      precioUnit: '0'
    }])
    setNextDetalleId(prev => prev + 1)
  }

  const eliminarDetalle = (id) => {
    if (detalles.length > 1) {
      setDetalles(prev => prev.filter(det => det.id !== id))
    }
  }

  const agregarRepuesto = () => {
    setRepuestos(prev => [...prev, {
      id: nextRepuestoId,
      nombre: ''
    }])
    setNextRepuestoId(prev => prev + 1)
  }

  const eliminarRepuesto = (id) => {
    setRepuestos(prev => prev.filter(rep => rep.id !== id))
  }

  const handleRepuestoChange = (id, value) => {
    setRepuestos(prev => prev.map(rep => 
      rep.id === id ? { ...rep, nombre: value } : rep
    ))
  }

  const calcularTotal = () => {
    return detalles.reduce((total, det) => {
      const cantidad = parseFloat(det.cantidad) || 0
      const precio = parseFloat(det.precioUnit) || 0
      return total + (cantidad * precio)
    }, 0).toFixed(2)
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida'
    if (!formData.clienteCi) newErrors.clienteCi = 'El cliente es requerido'
    
    // Validar que haya al menos un detalle válido
    const detallesValidos = detalles.filter(det => det.descripcion.trim() !== '')
    if (detallesValidos.length === 0) {
      newErrors.detalles = 'Debe agregar al menos un detalle con descripción'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)

    const detallesFormateados = detalles
      .filter(det => det.descripcion.trim() !== '')
      .map(det => ({
        servicioId: det.servicioId || null,
        descripcion: det.descripcion,
        cantidad: parseFloat(det.cantidad) || 1,
        precioUnit: parseFloat(det.precioUnit) || 0
      }))

    const repuestosFormateados = repuestos
      .filter(rep => rep.nombre.trim() !== '')
      .map(rep => ({
        nombre: rep.nombre
      }))

    const dataToSend = {
      fecha: formData.fecha,
      clienteCi: parseInt(formData.clienteCi),
      diagnosticoId: formData.diagnosticoId || null,
      estado: formData.estado,
      detalles: detallesFormateados,
      repuestos: repuestosFormateados
    }

    await onSave(dataToSend)
    setLoading(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          {proforma ? 'Editar Proforma' : 'Nueva Proforma'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Información General */}
            <Box>
              <Text fontWeight="bold" mb={3}>Información General</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl isInvalid={errors.fecha} isRequired>
                    <FormLabel>Fecha</FormLabel>
                    <Input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <FormErrorMessage>{errors.fecha}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isInvalid={errors.clienteCi} isRequired>
                    <FormLabel>Cliente</FormLabel>
                    <Select
                      name="clienteCi"
                      value={formData.clienteCi}
                      onChange={handleChange}
                      placeholder="Seleccione un cliente"
                    >
                      {clientes.map((cliente) => (
                        <option key={cliente.ci} value={cliente.ci}>
                          {cliente.nombre} {cliente.apellidos} (CI: {cliente.ci})
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.clienteCi}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FormLabel>Diagnóstico (Opcional)</FormLabel>
                    <Select
                      name="diagnosticoId"
                      value={formData.diagnosticoId}
                      onChange={handleChange}
                      placeholder="Sin diagnóstico"
                    >
                      {diagnosticos.map((diagnostico) => (
                        <option key={diagnostico.nro} value={diagnostico.nro}>
                          #{diagnostico.nro} - {diagnostico.moto?.placa} ({new Date(diagnostico.fecha).toLocaleDateString()})
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </GridItem>

                {proforma && (
                  <GridItem>
                    <FormControl>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="APROBADA">Aprobada</option>
                        <option value="RECHAZADA">Rechazada</option>
                        <option value="COMPLETADA">Completada</option>
                      </Select>
                    </FormControl>
                  </GridItem>
                )}
              </Grid>
            </Box>

            <Divider />

            {/* Detalles de Servicios */}
            <Box>
              <HStack justifyContent="space-between" mb={3}>
                <Text fontWeight="bold">Detalles de Servicios *</Text>
                <Button size="sm" leftIcon={<AddIcon />} colorScheme="blue" onClick={agregarDetalle}>
                  Agregar Detalle
                </Button>
              </HStack>
              
              {errors.detalles && <Text color="red.500" fontSize="sm" mb={2}>{errors.detalles}</Text>}

              <Box overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Servicio</Th>
                      <Th>Descripción</Th>
                      <Th>Cantidad</Th>
                      <Th>Precio Unit.</Th>
                      <Th>Subtotal</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {detalles.map((detalle) => {
                      const subtotal = (parseFloat(detalle.cantidad) || 0) * (parseFloat(detalle.precioUnit) || 0)
                      return (
                        <Tr key={detalle.id}>
                          <Td>
                            <Select
                              size="sm"
                              value={detalle.servicioId}
                              onChange={(e) => handleServicioChange(detalle.id, e.target.value)}
                              placeholder="Personalizado"
                            >
                              {servicios.map((servicio) => (
                                <option key={servicio.id} value={servicio.id}>
                                  {servicio.descripcion}
                                </option>
                              ))}
                            </Select>
                          </Td>
                          <Td>
                            <Input
                              size="sm"
                              value={detalle.descripcion}
                              onChange={(e) => handleDetalleChange(detalle.id, 'descripcion', e.target.value)}
                              placeholder="Descripción del servicio"
                            />
                          </Td>
                          <Td>
                            <NumberInput
                              size="sm"
                              min={0.01}
                              precision={2}
                              value={detalle.cantidad}
                              onChange={(value) => handleDetalleChange(detalle.id, 'cantidad', value)}
                            >
                              <NumberInputField />
                            </NumberInput>
                          </Td>
                          <Td>
                            <NumberInput
                              size="sm"
                              min={0}
                              precision={2}
                              value={detalle.precioUnit}
                              onChange={(value) => handleDetalleChange(detalle.id, 'precioUnit', value)}
                            >
                              <NumberInputField />
                            </NumberInput>
                          </Td>
                          <Td fontWeight="bold">Bs. {subtotal.toFixed(2)}</Td>
                          <Td>
                            <IconButton
                              size="sm"
                              icon={<DeleteIcon />}
                              colorScheme="red"
                              onClick={() => eliminarDetalle(detalle.id)}
                              isDisabled={detalles.length === 1}
                            />
                          </Td>
                        </Tr>
                      )
                    })}
                  </Tbody>
                </Table>
              </Box>

              <Box mt={3} p={3} bg="green.50" borderRadius="md">
                <HStack justifyContent="space-between">
                  <Text fontWeight="bold">TOTAL:</Text>
                  <Text fontSize="xl" fontWeight="bold" color="green.600">
                    Bs. {calcularTotal()}
                  </Text>
                </HStack>
              </Box>
            </Box>

            <Divider />

            {/* Repuestos */}
            <Box>
              <HStack justifyContent="space-between" mb={3}>
                <Text fontWeight="bold">Repuestos Necesarios (Opcional)</Text>
                <Button size="sm" leftIcon={<AddIcon />} colorScheme="orange" onClick={agregarRepuesto}>
                  Agregar Repuesto
                </Button>
              </HStack>

              {repuestos.length > 0 && (
                <VStack align="stretch" spacing={2}>
                  {repuestos.map((repuesto) => (
                    <HStack key={repuesto.id}>
                      <Input
                        value={repuesto.nombre}
                        onChange={(e) => handleRepuestoChange(repuesto.id, e.target.value)}
                        placeholder="Nombre del repuesto"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        onClick={() => eliminarRepuesto(repuesto.id)}
                      />
                    </HStack>
                  ))}
                </VStack>
              )}
              {repuestos.length === 0 && (
                <Text fontSize="sm" color="gray.500">No hay repuestos agregados</Text>
              )}
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={loading}
          >
            {proforma ? 'Actualizar' : 'Crear'} Proforma
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ProformaModal
