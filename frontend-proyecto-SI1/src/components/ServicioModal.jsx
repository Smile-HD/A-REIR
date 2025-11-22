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
  RadioGroup,
  Radio,
  Text,
  Textarea,
} from '@chakra-ui/react'

function ServicioModal({ isOpen, onClose, servicio, categorias, onSave }) {
  const [formData, setFormData] = useState({
    descripcion: '',
    categoriaId: '',
    categoriaNombre: ''
  })
  const [usarCategoriaNueva, setUsarCategoriaNueva] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (servicio) {
      setFormData({
        descripcion: servicio.descripcion || '',
        categoriaId: servicio.categoriaId || '',
        categoriaNombre: ''
      })
      setUsarCategoriaNueva(false)
    } else {
      setFormData({
        descripcion: '',
        categoriaId: '',
        categoriaNombre: ''
      })
      setUsarCategoriaNueva(false)
    }
    setErrors({})
  }, [servicio, isOpen])

  const validate = () => {
    const newErrors = {}
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida'
    } else if (formData.descripcion.length > 200) {
      newErrors.descripcion = 'La descripción no puede exceder 200 caracteres'
    }

    // Validar categoría
    if (usarCategoriaNueva) {
      if (!formData.categoriaNombre.trim()) {
        newErrors.categoriaNombre = 'El nombre de la categoría es requerido'
      } else if (formData.categoriaNombre.length > 80) {
        newErrors.categoriaNombre = 'El nombre no puede exceder 80 caracteres'
      }
    } else {
      if (!formData.categoriaId) {
        newErrors.categoriaId = 'Debe seleccionar una categoría'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    const dataToSend = {
      descripcion: formData.descripcion,
      categoriaId: usarCategoriaNueva ? null : parseInt(formData.categoriaId),
      categoriaNombre: usarCategoriaNueva ? formData.categoriaNombre : null
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

  const handleCategoriaOptionChange = (value) => {
    setUsarCategoriaNueva(value === 'nueva')
    setErrors(prev => ({
      ...prev,
      categoriaId: '',
      categoriaNombre: ''
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {servicio ? 'Editar Servicio' : 'Nuevo Servicio'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isInvalid={errors.descripcion} isRequired>
              <FormLabel>Descripción del Servicio</FormLabel>
              <Textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Ingrese la descripción del servicio"
                rows={3}
                maxLength={200}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {formData.descripcion.length}/200 caracteres
              </Text>
              <FormErrorMessage>{errors.descripcion}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Categoría</FormLabel>
              <RadioGroup 
                value={usarCategoriaNueva ? 'nueva' : 'existente'} 
                onChange={handleCategoriaOptionChange}
              >
                <HStack spacing={8}>
                  <Radio value="existente">Seleccionar existente</Radio>
                  <Radio value="nueva">Crear nueva categoría</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            {!usarCategoriaNueva ? (
              <FormControl isInvalid={errors.categoriaId} isRequired>
                <FormLabel>Seleccionar Categoría</FormLabel>
                <Select
                  name="categoriaId"
                  value={formData.categoriaId}
                  onChange={handleChange}
                  placeholder="Seleccione una categoría"
                >
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.categoriaId}</FormErrorMessage>
              </FormControl>
            ) : (
              <FormControl isInvalid={errors.categoriaNombre} isRequired>
                <FormLabel>Nombre de Nueva Categoría</FormLabel>
                <Input
                  name="categoriaNombre"
                  value={formData.categoriaNombre}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre de la categoría"
                  maxLength={80}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {formData.categoriaNombre.length}/80 caracteres
                </Text>
                <FormErrorMessage>{errors.categoriaNombre}</FormErrorMessage>
              </FormControl>
            )}

            {usarCategoriaNueva && (
              <Text fontSize="sm" color="blue.600" fontStyle="italic">
                💡 Si ya existe una categoría con este nombre, se usará la existente.
              </Text>
            )}
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
            {servicio ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ServicioModal
