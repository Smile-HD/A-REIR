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
  Box,
  HStack,
  IconButton,
  Textarea,
  Text,
  Divider,
  Badge,
} from '@chakra-ui/react'
import { DeleteIcon, AddIcon } from '@chakra-ui/icons'

function DiagnosticoModal({ isOpen, onClose, diagnostico, motos, empleados, onSave }) {
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    placaMoto: '',
    empleadoCi: '',
    detalles: [{ descripcion: '' }]
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (diagnostico) {
      const fechaFormatted = new Date(diagnostico.fecha).toISOString().split('T')[0]
      const horaFormatted = new Date(diagnostico.hora).toTimeString().slice(0, 5)
      
      setFormData({
        fecha: fechaFormatted,
        hora: horaFormatted,
        placaMoto: diagnostico.placaMoto || '',
        empleadoCi: diagnostico.empleadoCi || '',
        detalles: diagnostico.detalles?.length > 0 
          ? diagnostico.detalles.map(d => ({ descripcion: d.descripcion }))
          : [{ descripcion: '' }]
      })
    } else {
      const today = new Date().toISOString().split('T')[0]
      const now = new Date().toTimeString().slice(0, 5)
      setFormData({
        fecha: today,
        hora: now,
        placaMoto: '',
        empleadoCi: '',
        detalles: [{ descripcion: '' }]
      })
    }
    setErrors({})
  }, [diagnostico, isOpen])

  const validate = () => {
    const newErrors = {}
    
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida'
    }

    if (!formData.hora) {
      newErrors.hora = 'La hora es requerida'
    }

    if (!formData.placaMoto) {
      newErrors.placaMoto = 'Debe seleccionar una moto'
    }

    if (!formData.empleadoCi) {
      newErrors.empleadoCi = 'Debe seleccionar un empleado'
    }

    // Validar detalles
    if (formData.detalles.length === 0) {
      newErrors.detalles = 'Debe agregar al menos un detalle'
    } else {
      const detallesVacios = formData.detalles.some(d => !d.descripcion.trim())
      if (detallesVacios) {
        newErrors.detalles = 'Todos los detalles deben tener una descripción'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    const dataToSend = {
      fecha: formData.fecha,
      hora: formData.hora,
      placaMoto: formData.placaMoto,
      empleadoCi: parseInt(formData.empleadoCi),
      detalles: formData.detalles.filter(d => d.descripcion.trim())
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

  const handleDetalleChange = (index, value) => {
    const newDetalles = [...formData.detalles]
    newDetalles[index].descripcion = value
    setFormData(prev => ({
      ...prev,
      detalles: newDetalles
    }))
    if (errors.detalles) {
      setErrors(prev => ({
        ...prev,
        detalles: ''
      }))
    }
  }

  const addDetalle = () => {
    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, { descripcion: '' }]
    }))
  }

  const removeDetalle = (index) => {
    if (formData.detalles.length > 1) {
      const newDetalles = formData.detalles.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        detalles: newDetalles
      }))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          {diagnostico ? 'Editar Diagnóstico' : 'Nuevo Diagnóstico'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl isInvalid={errors.fecha}>
                  <FormLabel>Fecha</FormLabel>
                  <Input
                    name="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.fecha}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={errors.hora}>
                  <FormLabel>Hora</FormLabel>
                  <Input
                    name="hora"
                    type="time"
                    value={formData.hora}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.hora}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem colSpan={2}>
                <FormControl isInvalid={errors.placaMoto}>
                  <FormLabel>Moto</FormLabel>
                  <Select
                    name="placaMoto"
                    value={formData.placaMoto}
                    onChange={handleChange}
                    placeholder="Selecciona una moto"
                  >
                    {motos.map(moto => (
                      <option key={moto.placa} value={moto.placa}>
                        {moto.placa} - {moto.marca.nombre} {moto.modelo} ({moto.anio})
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.placaMoto}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem colSpan={2}>
                <FormControl isInvalid={errors.empleadoCi}>
                  <FormLabel>Empleado</FormLabel>
                  <Select
                    name="empleadoCi"
                    value={formData.empleadoCi}
                    onChange={handleChange}
                    placeholder="Selecciona un empleado"
                  >
                    {empleados.map(empleado => (
                      <option key={empleado.ci} value={empleado.ci}>
                        {empleado.nombre} {empleado.apellidos} (CI: {empleado.ci})
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.empleadoCi}</FormErrorMessage>
                </FormControl>
              </GridItem>
            </Grid>

            <Divider />

            <Box>
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="bold" fontSize="lg">
                  Detalles del Diagnóstico
                  <Badge ml={2} colorScheme="teal">{formData.detalles.length}</Badge>
                </Text>
                <Button
                  leftIcon={<AddIcon />}
                  size="sm"
                  colorScheme="teal"
                  variant="outline"
                  onClick={addDetalle}
                >
                  Agregar Detalle
                </Button>
              </HStack>

              {errors.detalles && (
                <Text color="red.500" fontSize="sm" mb={2}>
                  {errors.detalles}
                </Text>
              )}

              <VStack spacing={3} align="stretch">
                {formData.detalles.map((detalle, index) => (
                  <Box
                    key={index}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <HStack align="start" spacing={2}>
                      <VStack flex={1} align="stretch" spacing={1}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.600">
                          Detalle {index + 1}
                        </Text>
                        <Textarea
                          value={detalle.descripcion}
                          onChange={(e) => handleDetalleChange(index, e.target.value)}
                          placeholder="Describe el problema, revisión o recomendación..."
                          size="sm"
                          rows={2}
                        />
                      </VStack>
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeDetalle(index)}
                        aria-label="Eliminar detalle"
                        isDisabled={formData.detalles.length === 1}
                      />
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
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
            {diagnostico ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DiagnosticoModal
