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

function RolModal({ isOpen, onClose, rol, onSave }) {
  const [formData, setFormData] = useState({
    nombre: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (rol) {
      setFormData({
        nombre: rol.nombre || ''
      })
    } else {
      setFormData({
        nombre: ''
      })
    }
    setErrors({})
  }, [rol, isOpen])

  const validate = () => {
    const newErrors = {}
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {rol ? 'Editar Rol' : 'Nuevo Rol'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isInvalid={errors.nombre}>
              <FormLabel>Nombre del Rol</FormLabel>
              <Input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Administrador, Usuario, etc."
              />
              <FormErrorMessage>{errors.nombre}</FormErrorMessage>
            </FormControl>
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
            {rol ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default RolModal
