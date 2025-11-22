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
} from '@chakra-ui/react'

function UsuarioModal({ isOpen, onClose, usuario, roles, onSave }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    idRol: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (usuario) {
      setFormData({
        username: usuario.username || '',
        email: usuario.email || '',
        password: '',
        idRol: usuario.idRol || ''
      })
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        idRol: ''
      })
    }
    setErrors({})
  }, [usuario, isOpen])

  const validate = () => {
    const newErrors = {}
    
    if (!formData.username.trim()) {
      newErrors.username = 'El username es requerido'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!usuario && !formData.password) {
      newErrors.password = 'La contraseña es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    
    const dataToSend = {
      username: formData.username,
      email: formData.email,
      idRol: formData.idRol ? parseInt(formData.idRol) : null
    }

    // Solo enviar password si se proporcionó
    if (formData.password) {
      dataToSend.password = formData.password
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
    // Limpiar error del campo al escribir
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
          {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isInvalid={errors.username}>
              <FormLabel>Username</FormLabel>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ingrese el username"
              />
              <FormErrorMessage>{errors.username}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.password}>
              <FormLabel>
                {usuario ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
              </FormLabel>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={usuario ? 'Dejar vacío para mantener actual' : 'Ingrese la contraseña'}
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Rol</FormLabel>
              <Select
                name="idRol"
                value={formData.idRol}
                onChange={handleChange}
                placeholder="Seleccionar rol"
              >
                {roles.map(rol => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </option>
                ))}
              </Select>
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
            {usuario ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default UsuarioModal
