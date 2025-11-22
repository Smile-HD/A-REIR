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
  Select,
  VStack,
  FormErrorMessage,
  Text,
} from '@chakra-ui/react'

function HorarioEmpleadoModal({ isOpen, onClose, empleados, horarios, onSave }) {
  const [formData, setFormData] = useState({
    empleadoCi: '',
    horarioId: '',
    fecha: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        empleadoCi: '',
        horarioId: '',
        fecha: new Date().toISOString().split('T')[0]
      })
      setErrors({})
    }
  }, [isOpen])

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

  const validate = () => {
    const newErrors = {}
    
    if (!formData.empleadoCi) {
      newErrors.empleadoCi = 'El empleado es requerido'
    }
    if (!formData.horarioId) {
      newErrors.horarioId = 'El horario es requerido'
    }
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    await onSave({
      empleadoCi: parseInt(formData.empleadoCi),
      horarioId: parseInt(formData.horarioId),
      fecha: formData.fecha
    })
    setLoading(false)
  }

  const formatTime = (dateTime) => {
    if (!dateTime) return ''
    const date = new Date(dateTime)
    return date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Asignar Horario a Empleado</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isInvalid={errors.empleadoCi} isRequired>
              <FormLabel>Empleado</FormLabel>
              <Select
                name="empleadoCi"
                value={formData.empleadoCi}
                onChange={handleChange}
                placeholder="Seleccione un empleado"
              >
                {empleados.map((empleado) => (
                  <option key={empleado.ci} value={empleado.ci}>
                    {empleado.nombre} {empleado.apellidos} (CI: {empleado.ci})
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.empleadoCi}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.horarioId} isRequired>
              <FormLabel>Horario</FormLabel>
              <Select
                name="horarioId"
                value={formData.horarioId}
                onChange={handleChange}
                placeholder="Seleccione un horario"
              >
                {horarios.map((horario) => (
                  <option key={horario.id} value={horario.id}>
                    {formatTime(horario.horaInicio)} - {formatTime(horario.horaFin)}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.horarioId}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.fecha} isRequired>
              <FormLabel>Fecha</FormLabel>
              <Input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.fecha}</FormErrorMessage>
            </FormControl>

            <Text fontSize="sm" color="gray.600">
              Nota: Si el empleado ya tiene asignado este horario, se actualizará la fecha.
            </Text>
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
            Asignar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default HorarioEmpleadoModal
