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
  Grid,
  GridItem,
} from '@chakra-ui/react'

function ClienteModal({ isOpen, onClose, cliente, onSave }) {
  const [formData, setFormData] = useState({
    ci: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    direccion: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (cliente) {
      setFormData({
        ci: cliente.ci || '',
        nombre: cliente.nombre || '',
        apellidos: cliente.apellidos || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || ''
      })
    } else {
      setFormData({
        ci: '',
        nombre: '',
        apellidos: '',
        telefono: '',
        direccion: ''
      })
    }
    setErrors({})
  }, [cliente, isOpen])

  const validate = () => {
    const newErrors = {}
    
    if (!formData.ci) {
      newErrors.ci = 'El CI es requerido'
    } else if (!/^\d+$/.test(formData.ci)) {
      newErrors.ci = 'El CI debe ser numérico'
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    } else if (formData.nombre.length > 50) {
      newErrors.nombre = 'El nombre no puede exceder 50 caracteres'
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos'
    } else if (formData.apellidos.length > 100) {
      newErrors.apellidos = 'Los apellidos no pueden exceder 100 caracteres'
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
    } else if (!/^\d{7,15}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener entre 7 y 15 dígitos'
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida'
    } else if (formData.direccion.length > 200) {
      newErrors.direccion = 'La dirección no puede exceder 200 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    const dataToSend = {
      ...formData,
      ci: parseInt(formData.ci)
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
              <GridItem>
                <FormControl isInvalid={errors.ci} isRequired>
                  <FormLabel>CI</FormLabel>
                  <Input
                    name="ci"
                    value={formData.ci}
                    onChange={handleChange}
                    placeholder="Ingrese el CI"
                    isDisabled={!!cliente}
                  />
                  <FormErrorMessage>{errors.ci}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={errors.telefono} isRequired>
                  <FormLabel>Teléfono</FormLabel>
                  <Input
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ingrese el teléfono"
                  />
                  <FormErrorMessage>{errors.telefono}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={errors.nombre} isRequired>
                  <FormLabel>Nombre</FormLabel>
                  <Input
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ingrese el nombre"
                  />
                  <FormErrorMessage>{errors.nombre}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={errors.apellidos} isRequired>
                  <FormLabel>Apellidos</FormLabel>
                  <Input
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    placeholder="Ingrese los apellidos"
                  />
                  <FormErrorMessage>{errors.apellidos}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem colSpan={2}>
                <FormControl isInvalid={errors.direccion} isRequired>
                  <FormLabel>Dirección</FormLabel>
                  <Input
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Ingrese la dirección"
                  />
                  <FormErrorMessage>{errors.direccion}</FormErrorMessage>
                </FormControl>
              </GridItem>
            </Grid>
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
            {cliente ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ClienteModal
