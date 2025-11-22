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

function ComisionModal({ isOpen, onClose, comision, ordenesFinalizadas, onSave }) {
  const [formData, setFormData] = useState({
    ordenId: '',
    estadoPago: 'PENDIENTE',
    fechaPago: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (comision) {
      setFormData({
        ordenId: comision.ordenId || '',
        estadoPago: comision.estadoPago || 'PENDIENTE',
        fechaPago: comision.fechaPago ? new Date(comision.fechaPago).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      })
    } else {
      setFormData({
        ordenId: '',
        estadoPago: 'PENDIENTE',
        fechaPago: new Date().toISOString().split('T')[0]
      })
    }
    setErrors({})
  }, [comision, isOpen])

  const validate = () => {
    const newErrors = {}
    
    if (!formData.ordenId) {
      newErrors.ordenId = 'Debe seleccionar una orden de trabajo'
    }

    if (!formData.estadoPago) {
      newErrors.estadoPago = 'El estado de pago es requerido'
    }

    if (!formData.fechaPago) {
      newErrors.fechaPago = 'La fecha de pago es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    const dataToSend = {
      ordenId: parseInt(formData.ordenId),
      estadoPago: formData.estadoPago,
      fechaPago: formData.fechaPago
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
      PENDIENTE: 'yellow',
      PAGADO: 'green',
      CANCELADO: 'red'
    }
    return colors[estado] || 'gray'
  }

  const selectedOrden = ordenesFinalizadas?.find(o => o.id === parseInt(formData.ordenId))

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {comision ? 'Editar Comisión' : 'Nueva Comisión'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
              <GridItem colSpan={2}>
                <FormControl isInvalid={errors.ordenId} isRequired>
                  <FormLabel>Orden de Trabajo</FormLabel>
                  <Select
                    name="ordenId"
                    value={formData.ordenId}
                    onChange={handleChange}
                    placeholder="Seleccione una orden de trabajo"
                    isDisabled={!!comision} // No se puede cambiar la orden una vez creada
                  >
                    {ordenesFinalizadas?.map(orden => (
                      <option key={orden.id} value={orden.id}>
                        #{orden.id} - {orden.empleado?.nombre} {orden.empleado?.apellidos} - Total: Bs. {orden.detalle?.proforma?.total || 0}
                      </option>
                    ))}
                  </Select>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Solo se muestran órdenes finalizadas sin comisión asignada. La comisión será la mitad del total de la orden.
                  </Text>
                  <FormErrorMessage>{errors.ordenId}</FormErrorMessage>
                </FormControl>
              </GridItem>

              {selectedOrden && (
                <GridItem colSpan={2}>
                  <Box p={3} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.500">
                    <Text fontWeight="bold" mb={2} color="blue.700">Detalle de la orden seleccionada:</Text>
                    <Text fontSize="sm">Empleado: {selectedOrden.empleado?.nombre} {selectedOrden.empleado?.apellidos}</Text>
                    <Text fontSize="sm">Fecha inicio: {new Date(selectedOrden.fechaInicio).toLocaleDateString('es-ES')}</Text>
                    <Text fontSize="sm">Fecha fin: {selectedOrden.fechaFin ? new Date(selectedOrden.fechaFin).toLocaleDateString('es-ES') : 'N/A'}</Text>
                    {selectedOrden.detalle && (
                      <>
                        <Text fontSize="sm">Servicio: {selectedOrden.detalle.descripcion}</Text>
                        <Text fontSize="sm" fontWeight="bold" color="green.600" mt={2}>
                          Total de la orden: Bs. {selectedOrden.detalle?.proforma?.total || 0}
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="teal.600">
                          Comisión a generar (50%): Bs. {((selectedOrden.detalle?.proforma?.total || 0) / 2).toFixed(2)}
                        </Text>
                      </>
                    )}
                  </Box>
                </GridItem>
              )}

              <GridItem colSpan={2}>
                <FormControl isInvalid={errors.estadoPago} isRequired>
                  <FormLabel>Estado de Pago</FormLabel>
                  <Select
                    name="estadoPago"
                    value={formData.estadoPago}
                    onChange={handleChange}
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="PAGADO">Pagado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </Select>
                  <FormErrorMessage>{errors.estadoPago}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem colSpan={2}>
                <FormControl isInvalid={errors.fechaPago} isRequired>
                  <FormLabel>Fecha de Pago</FormLabel>
                  <Input
                    name="fechaPago"
                    type="date"
                    value={formData.fechaPago}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.fechaPago}</FormErrorMessage>
                </FormControl>
              </GridItem>
            </Grid>

            {comision && (
              <Box w="100%" p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="bold">
                  Estado actual: <Badge colorScheme={getEstadoBadgeColor(comision.estadoPago)}>{comision.estadoPago}</Badge>
                </Text>
                {comision.ordenTrabajo && (
                  <Text fontSize="sm" mt={1}>
                    Orden #{comision.ordenTrabajo.id} - {comision.ordenTrabajo.empleado?.nombre} {comision.ordenTrabajo.empleado?.apellidos}
                  </Text>
                )}
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
            {comision ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ComisionModal
