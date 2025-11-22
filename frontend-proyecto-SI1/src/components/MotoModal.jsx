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
} from '@chakra-ui/react'

function MotoModal({ isOpen, onClose, moto, marcas, onSave }) {
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    anio: '',
    chasis: '',
    marcaId: '',
    marcaNombre: ''
  })
  const [usarMarcaNueva, setUsarMarcaNueva] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (moto) {
      setFormData({
        placa: moto.placa || '',
        modelo: moto.modelo || '',
        anio: moto.anio || '',
        chasis: moto.chasis || '',
        marcaId: moto.marcaId || '',
        marcaNombre: ''
      })
      setUsarMarcaNueva(false)
    } else {
      setFormData({
        placa: '',
        modelo: '',
        anio: '',
        chasis: '',
        marcaId: '',
        marcaNombre: ''
      })
      setUsarMarcaNueva(false)
    }
    setErrors({})
  }, [moto, isOpen])

  const validate = () => {
    const newErrors = {}
    
    if (!formData.placa.trim()) {
      newErrors.placa = 'La placa es requerida'
    } else if (formData.placa.length > 10) {
      newErrors.placa = 'La placa no puede exceder 10 caracteres'
    }

    if (!formData.modelo.trim()) {
      newErrors.modelo = 'El modelo es requerido'
    }

    if (!formData.anio) {
      newErrors.anio = 'El año es requerido'
    } else {
      const anioNum = parseInt(formData.anio)
      if (anioNum < 1900 || anioNum > 2100) {
        newErrors.anio = 'El año debe estar entre 1900 y 2100'
      }
    }

    // Validar marca
    if (usarMarcaNueva) {
      if (!formData.marcaNombre.trim()) {
        newErrors.marcaNombre = 'El nombre de la marca es requerido'
      }
    } else {
      if (!formData.marcaId) {
        newErrors.marcaId = 'Debe seleccionar una marca'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    const dataToSend = {
      placa: formData.placa,
      modelo: formData.modelo,
      anio: parseInt(formData.anio),
      chasis: formData.chasis || null,
      marcaId: usarMarcaNueva ? null : parseInt(formData.marcaId),
      marcaNombre: usarMarcaNueva ? formData.marcaNombre : null
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

  const handleMarcaOptionChange = (value) => {
    setUsarMarcaNueva(value === 'nueva')
    setErrors(prev => ({
      ...prev,
      marcaId: '',
      marcaNombre: ''
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {moto ? 'Editar Moto' : 'Nueva Moto'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
              <GridItem>
                <FormControl isInvalid={errors.placa}>
                  <FormLabel>Placa</FormLabel>
                  <Input
                    name="placa"
                    value={formData.placa}
                    onChange={handleChange}
                    placeholder="ABC-123"
                    maxLength={10}
                    isDisabled={!!moto}
                    textTransform="uppercase"
                  />
                  <FormErrorMessage>{errors.placa}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={errors.anio}>
                  <FormLabel>Año</FormLabel>
                  <Input
                    name="anio"
                    type="number"
                    value={formData.anio}
                    onChange={handleChange}
                    placeholder="2024"
                    min={1900}
                    max={2100}
                  />
                  <FormErrorMessage>{errors.anio}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem colSpan={2}>
                <FormControl isInvalid={errors.modelo}>
                  <FormLabel>Modelo</FormLabel>
                  <Input
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    placeholder="CBR 600RR"
                  />
                  <FormErrorMessage>{errors.modelo}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem colSpan={2}>
                <FormControl>
                  <FormLabel>Chasis (Opcional)</FormLabel>
                  <Input
                    name="chasis"
                    value={formData.chasis}
                    onChange={handleChange}
                    placeholder="JH2PC40001M123456"
                    fontFamily="mono"
                  />
                </FormControl>
              </GridItem>

              <GridItem colSpan={2}>
                <FormControl>
                  <FormLabel>Marca</FormLabel>
                  <RadioGroup 
                    value={usarMarcaNueva ? 'nueva' : 'existente'} 
                    onChange={handleMarcaOptionChange}
                    mb={3}
                  >
                    <HStack spacing={5}>
                      <Radio value="existente">Marca existente</Radio>
                      <Radio value="nueva">Nueva marca</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
              </GridItem>

              {!usarMarcaNueva ? (
                <GridItem colSpan={2}>
                  <FormControl isInvalid={errors.marcaId}>
                    <FormLabel>Seleccionar Marca</FormLabel>
                    <Select
                      name="marcaId"
                      value={formData.marcaId}
                      onChange={handleChange}
                      placeholder="Selecciona una marca"
                    >
                      {marcas.map(marca => (
                        <option key={marca.id} value={marca.id}>
                          {marca.nombre} ({marca._count?.motos || 0} motos)
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.marcaId}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              ) : (
                <GridItem colSpan={2}>
                  <FormControl isInvalid={errors.marcaNombre}>
                    <FormLabel>Nombre de Nueva Marca</FormLabel>
                    <Input
                      name="marcaNombre"
                      value={formData.marcaNombre}
                      onChange={handleChange}
                      placeholder="Ej: Honda, Yamaha, Suzuki..."
                    />
                    <FormErrorMessage>{errors.marcaNombre}</FormErrorMessage>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Se creará una nueva marca con este nombre
                    </Text>
                  </FormControl>
                </GridItem>
              )}
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
            {moto ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MotoModal
