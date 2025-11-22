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
} from '@chakra-ui/react'

function EmpleadoModal({ isOpen, onClose, empleado, usuarios, onSave }) {
  const [formData, setFormData] = useState({
    ci: '',
    idUsuario: '',
    nombre: '',
    apellidos: '',
    direccion: '',
    fechaNac: '',
    telefono: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (empleado) {
      setFormData({
        ci: empleado.ci || '',
        idUsuario: empleado.idUsuario || '',
        nombre: empleado.nombre || '',
        apellidos: empleado.apellidos || '',
        direccion: empleado.direccion || '',
        fechaNac: empleado.fechaNac ? new Date(empleado.fechaNac).toISOString().split('T')[0] : '',
        telefono: empleado.telefono || ''
      })
    } else {
      setFormData({
        ci: '',
        idUsuario: '',
        nombre: '',
        apellidos: '',
        direccion: '',
        fechaNac: '',
        telefono: ''
      })
    }
    setErrors({})
  }, [empleado, isOpen])

  const validate = () => {
    const newErrors = {}
    
    if (!formData.ci) {
      newErrors.ci = 'El CI es requerido'
    } else if (!/^\d+$/.test(formData.ci)) {
      newErrors.ci = 'El CI debe ser numérico'
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    } else if (formData.nombre.length > 15) {
      newErrors.nombre = 'El nombre no puede exceder 15 caracteres'
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos'
    } else if (formData.apellidos.length > 50) {
      newErrors.apellidos = 'Los apellidos no pueden exceder 50 caracteres'
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida'
    } else if (formData.direccion.length > 70) {
      newErrors.direccion = 'La dirección no puede exceder 70 caracteres'
    }

    if (!formData.fechaNac) {
      newErrors.fechaNac = 'La fecha de nacimiento es requerida'
    } else {
      const fechaNacimiento = new Date(formData.fechaNac)
      const hoy = new Date()
      const edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
      if (edad < 18 || edad > 100) {
        newErrors.fechaNac = 'El empleado debe tener entre 18 y 100 años'
      }
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
    } else if (!/^\d{10}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    const dataToSend = {
      ...formData,
      ci: parseInt(formData.ci),
      idUsuario: formData.idUsuario ? parseInt(formData.idUsuario) : null
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

  // Filtrar usuarios que no están asignados a ningún empleado (o al empleado actual)
  const usuariosDisponibles = usuarios.filter(usuario => 
    !usuario.empleado || (empleado && usuario.id === empleado.idUsuario)
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {empleado ? 'Editar Empleado' : 'Nuevo Empleado'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
              <GridItem>
                <FormControl isInvalid={errors.ci}>
                  <FormLabel>CI</FormLabel>
                  <Input
                    name="ci"
                    value={formData.ci}
                    onChange={handleChange}
                    placeholder="12345678"
                    isDisabled={!!empleado}
                  />
                  <FormErrorMessage>{errors.ci}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={errors.telefono}>
                  <FormLabel>Teléfono</FormLabel>
                  <Input
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="1234567890"
                    maxLength={10}
                  />
                  <FormErrorMessage>{errors.telefono}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={errors.nombre}>
                  <FormLabel>Nombre</FormLabel>
                  <Input
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Juan"
                    maxLength={15}
                  />
                  <FormErrorMessage>{errors.nombre}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={errors.apellidos}>
                  <FormLabel>Apellidos</FormLabel>
                  <Input
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    placeholder="Pérez García"
                    maxLength={50}
                  />
                  <FormErrorMessage>{errors.apellidos}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem colSpan={2}>
                <FormControl isInvalid={errors.direccion}>
                  <FormLabel>Dirección</FormLabel>
                  <Input
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Calle 123, Ciudad"
                    maxLength={70}
                  />
                  <FormErrorMessage>{errors.direccion}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={errors.fechaNac}>
                  <FormLabel>Fecha de Nacimiento</FormLabel>
                  <Input
                    name="fechaNac"
                    type="date"
                    value={formData.fechaNac}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.fechaNac}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Usuario Asignado (Opcional)</FormLabel>
                  <Select
                    name="idUsuario"
                    value={formData.idUsuario}
                    onChange={handleChange}
                    placeholder="Sin usuario"
                  >
                    {usuariosDisponibles.map(usuario => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.username} - {usuario.email}
                      </option>
                    ))}
                  </Select>
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
            colorScheme="teal" 
            onClick={handleSubmit}
            isLoading={loading}
          >
            {empleado ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EmpleadoModal
