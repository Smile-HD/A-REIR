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
} from '@chakra-ui/react'

function HorarioModal({ isOpen, onClose, horario, onSave }) {
  const [formData, setFormData] = useState({
    horaInicio: '',
    horaFin: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (horario) {
      const inicio = new Date(horario.horaInicio)
      const fin = new Date(horario.horaFin)
      
      setFormData({
        horaInicio: inicio.toTimeString().slice(0, 5),
        horaFin: fin.toTimeString().slice(0, 5)
      })
    } else {
      setFormData({
        horaInicio: '',
        horaFin: ''
      })
    }
    setErrors({})
  }, [horario, isOpen])

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
    
    if (!formData.horaInicio) {
      newErrors.horaInicio = 'La hora de inicio es requerida'
    }
    if (!formData.horaFin) {
      newErrors.horaFin = 'La hora de fin es requerida'
    }
    
    if (formData.horaInicio && formData.horaFin) {
      if (formData.horaFin <= formData.horaInicio) {
        newErrors.horaFin = 'La hora de fin debe ser mayor a la hora de inicio'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    await onSave(formData)
    setLoading(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {horario ? 'Editar Horario' : 'Nuevo Horario'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isInvalid={errors.horaInicio} isRequired>
              <FormLabel>Hora de Inicio</FormLabel>
              <Input
                type="time"
                name="horaInicio"
                value={formData.horaInicio}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.horaInicio}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.horaFin} isRequired>
              <FormLabel>Hora de Fin</FormLabel>
              <Input
                type="time"
                name="horaFin"
                value={formData.horaFin}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.horaFin}</FormErrorMessage>
            </FormControl>
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
            {horario ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default HorarioModal
