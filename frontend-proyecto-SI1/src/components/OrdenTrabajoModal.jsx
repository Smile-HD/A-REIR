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
  Text,
  Box,
  Badge,
} from '@chakra-ui/react'

function OrdenTrabajoModal({ isOpen, onClose, orden, empleados, usuarios, detallesProforma, onSave }) {
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: 'ABIERTA',
    empleadoCi: '',
    usuarioId: '',
    detalleId: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (orden) {
      setFormData({
        fechaInicio: orden.fechaInicio ? new Date(orden.fechaInicio).toISOString().split('T')[0] : '',
        fechaFin: orden.fechaFin ? new Date(orden.fechaFin).toISOString().split('T')[0] : '',
        estado: orden.estado || 'ABIERTA',
        empleadoCi: orden.empleadoCi || '',
        usuarioId: orden.usuarioId || '',
        detalleId: orden.detalleId || ''
      })
    } else {
      setFormData({
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: '',
        estado: 'ABIERTA',
        empleadoCi: '',
        usuarioId: '',
        detalleId: ''
      })
    }
    setErrors({})
  }, [orden, isOpen])

  const validate = () => {
    const newErrors = {}
    
    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida'
    } else {
      const inicio = new Date(formData.fechaInicio)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      inicio.setHours(0, 0, 0, 0)
      
      if (inicio > hoy) {
        newErrors.fechaInicio = 'La fecha de inicio no puede ser mayor a hoy'
      }
    }

    if (formData.fechaFin) {
      const inicio = new Date(formData.fechaInicio)
      const fin = new Date(formData.fechaFin)
      
      if (fin < inicio) {
        newErrors.fechaFin = 'La fecha de fin no puede ser menor a la fecha de inicio'
      }
    }

    if (!formData.empleadoCi) {
      newErrors.empleadoCi = 'El empleado es requerido'
    }

    if (!formData.estado) {
      newErrors.estado = 'El estado es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    const dataToSend = {
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin || null,
      estado: formData.estado,
      empleadoCi: parseInt(formData.empleadoCi),
      usuarioId: formData.usuarioId ? parseInt(formData.usuarioId) : null,
      detalleId: formData.detalleId ? parseInt(formData.detalleId) : null
    }
    await onSave(dataToSend)
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const getEstadoBadgeColor = (estado) => {
    const colors = {
      ABIERTA: 'blue',
      EN_PROCESO: 'yellow',
      FINALIZADA: 'green',
      CANCELADA: 'red'
    }
    return colors[estado] || 'gray'
  }

  const selectedDetalle = detallesProforma?.find(d => d.id === parseInt(formData.detalleId))

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {orden ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
              <GridItem>
                <FormControl isInvalid={errors.fechaInicio} isRequired>
                  <FormLabel>Fecha de Inicio</FormLabel>
                  <Input
                    name="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <FormErrorMessage>{errors.fechaInicio}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={errors.fechaFin}>
                  <FormLabel>Fecha de Fin</FormLabel>
                  <Input
                    name="fechaFin"
                    type="date"
                    value={formData.fechaFin}
                    onChange={handleChange}
                    min={formData.fechaInicio}
                  />
                  <FormErrorMessage>{errors.fechaFin}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={errors.estado} isRequired>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="ABIERTA">Abierta</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="FINALIZADA">Finalizada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </Select>
                  <FormErrorMessage>{errors.estado}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={errors.empleadoCi} isRequired>
                  <FormLabel>Empleado Asignado</FormLabel>
                  <Select
                    name="empleadoCi"
                    value={formData.empleadoCi}
                    onChange={handleChange}
                    placeholder="Seleccione un empleado"
                  >
                    {empleados?.map(empleado => (
                      <option key={empleado.ci} value={empleado.ci}>
                        {empleado.nombre} {empleado.apellidos} (CI: {empleado.ci})
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.empleadoCi}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem colSpan={2}>
                <FormControl>
                  <FormLabel>Usuario (Opcional)</FormLabel>
                  <Select
                    name="usuarioId"
                    value={formData.usuarioId}
                    onChange={handleChange}
                    placeholder="Sin usuario asignado"
                  >
                    {usuarios?.map(usuario => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.username} - {usuario.email}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem colSpan={2}>
                <FormControl>
                  <FormLabel>Detalle de Proforma (Opcional)</FormLabel>
                  <Select
                    name="detalleId"
                    value={formData.detalleId}
                    onChange={handleChange}
                    placeholder="Sin detalle de proforma"
                  >
                    {detallesProforma?.map(detalle => (
                      <option key={detalle.id} value={detalle.id}>
                        Detalle #{detalle.id} - {detalle.descripcion} | Proforma #{detalle.proformaId} 
                        {detalle.proforma ? ` - ${detalle.proforma.estado} - Bs ${parseFloat(detalle.proforma.total).toFixed(2)}` : ''}
                      </option>
                    ))}
                  </Select>
                  {formData.detalleId && selectedDetalle?.proforma && (
                    <Text fontSize="xs" color="blue.600" mt={1} fontWeight="medium">
                      Estado actual: <Badge colorScheme={
                        selectedDetalle.proforma.estado === 'APROBADA' ? 'green' :
                        selectedDetalle.proforma.estado === 'COMPLETADA' ? 'blue' :
                        selectedDetalle.proforma.estado === 'PENDIENTE' ? 'yellow' : 'red'
                      }>{selectedDetalle.proforma.estado}</Badge>
                    </Text>
                  )}
                </FormControl>
              </GridItem>

              {selectedDetalle && (
                <GridItem colSpan={2}>
                  <Box p={4} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                    <Text fontWeight="bold" mb={3} color="gray.700">Información del Detalle:</Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                      <Text fontSize="sm"><strong>Descripción:</strong></Text>
                      <Text fontSize="sm">{selectedDetalle.descripcion}</Text>
                      
                      <Text fontSize="sm"><strong>Cantidad:</strong></Text>
                      <Text fontSize="sm">{selectedDetalle.cantidad}</Text>
                      
                      <Text fontSize="sm"><strong>Precio Unitario:</strong></Text>
                      <Text fontSize="sm">Bs {parseFloat(selectedDetalle.precioUnit).toFixed(2)}</Text>
                      
                      <Text fontSize="sm"><strong>Subtotal:</strong></Text>
                      <Text fontSize="sm" fontWeight="bold" color="green.600">
                        Bs {(parseFloat(selectedDetalle.cantidad) * parseFloat(selectedDetalle.precioUnit)).toFixed(2)}
                      </Text>
                      
                      {selectedDetalle.servicio && (
                        <>
                          <Text fontSize="sm"><strong>Servicio:</strong></Text>
                          <Text fontSize="sm">{selectedDetalle.servicio.descripcion}</Text>
                        </>
                      )}
                    </Grid>
                    
                    {selectedDetalle.proforma && (
                      <Box mt={3} pt={3} borderTopWidth="1px" borderColor="gray.300">
                        <Text fontWeight="bold" mb={2} color="teal.700">Información de la Proforma:</Text>
                        <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                          <Text fontSize="sm"><strong>Proforma ID:</strong></Text>
                          <Text fontSize="sm">#{selectedDetalle.proforma.id}</Text>
                          
                          <Text fontSize="sm"><strong>Estado:</strong></Text>
                          <Badge colorScheme={
                            selectedDetalle.proforma.estado === 'APROBADA' ? 'green' :
                            selectedDetalle.proforma.estado === 'COMPLETADA' ? 'blue' :
                            selectedDetalle.proforma.estado === 'PENDIENTE' ? 'yellow' : 'red'
                          }>
                            {selectedDetalle.proforma.estado}
                          </Badge>
                          
                          <Text fontSize="sm"><strong>Total Proforma:</strong></Text>
                          <Text fontSize="sm" fontWeight="bold" color="blue.600">
                            Bs {parseFloat(selectedDetalle.proforma.total).toFixed(2)}
                          </Text>
                          
                          <Text fontSize="sm"><strong>Fecha:</strong></Text>
                          <Text fontSize="sm">
                            {new Date(selectedDetalle.proforma.fecha).toLocaleDateString('es-ES')}
                          </Text>
                          
                          {selectedDetalle.proforma.cliente && (
                            <>
                              <Text fontSize="sm"><strong>Cliente:</strong></Text>
                              <Text fontSize="sm">
                                {selectedDetalle.proforma.cliente.nombre} {selectedDetalle.proforma.cliente.apellidos}
                                <Text as="span" fontSize="xs" color="gray.500"> (CI: {selectedDetalle.proforma.cliente.ci})</Text>
                              </Text>
                            </>
                          )}
                        </Grid>
                      </Box>
                    )}
                  </Box>
                </GridItem>
              )}
            </Grid>

            {orden && (
              <Box w="100%" p={3} bg="blue.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="bold">
                  Estado actual: <Badge colorScheme={getEstadoBadgeColor(orden.estado)}>{orden.estado}</Badge>
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            colorScheme="teal" 
            onClick={handleSubmit}
            isLoading={loading}
          >
            {orden ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default OrdenTrabajoModal
