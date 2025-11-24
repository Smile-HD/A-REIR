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
  Select,
  HStack,
  Text,
  Badge,
  Box,
} from '@chakra-ui/react'
import { API_URL } from '../config'

function FacturaModal({ isOpen, onClose, factura, onSave }) {
  const [formData, setFormData] = useState({
    clienteCi: '',
    proformaId: ''
  })
  const [clientes, setClientes] = useState([])
  const [proformas, setProformas] = useState([])
  const [selectedProforma, setSelectedProforma] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchClientes()
      fetchProformas()
    }
  }, [isOpen])

  useEffect(() => {
    if (factura) {
      setFormData({
        clienteCi: factura.clienteCi || '',
        proformaId: factura.proformaId || ''
      })
    } else {
      setFormData({
        clienteCi: '',
        proformaId: ''
      })
      setSelectedProforma(null)
    }
    setErrors({})
  }, [factura, isOpen])

  useEffect(() => {
    if (formData.proformaId) {
      const proforma = proformas.find(p => p.id.toString() === formData.proformaId.toString())
      setSelectedProforma(proforma)
      if (proforma) {
        setFormData(prev => ({
          ...prev,
          clienteCi: proforma.clienteCi.toString()
        }))
      }
    } else {
      setSelectedProforma(null)
    }
  }, [formData.proformaId, proformas])

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/clientes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setClientes(data.clientes || [])
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    }
  }

  const fetchProformas = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/proformas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      // Solo proformas aprobadas o completadas
      const proformasValidas = (data.proformas || []).filter(
        p => p.estado === 'APROBADA' || p.estado === 'COMPLETADA'
      )
      setProformas(proformasValidas)
    } catch (error) {
      console.error('Error al cargar proformas:', error)
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.clienteCi) {
      newErrors.clienteCi = 'El cliente es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
      handleClose()
    } catch (error) {
      console.error('Error al guardar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      clienteCi: '',
      proformaId: ''
    })
    setSelectedProforma(null)
    setErrors({})
    onClose()
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

  const getClienteNombre = (ci) => {
    const cliente = clientes.find(c => c.ci === parseInt(ci))
    return cliente ? `${cliente.nombre} ${cliente.apellidos}` : ''
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {factura ? 'Editar Factura' : 'Nueva Factura'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={errors.proformaId}>
                <FormLabel>Proforma (Opcional)</FormLabel>
                <Select
                  name="proformaId"
                  value={formData.proformaId}
                  onChange={handleChange}
                  placeholder="Seleccionar proforma"
                  isDisabled={!!factura}
                >
                  {proformas.map(proforma => (
                    <option key={proforma.id} value={proforma.id}>
                      Proforma #{proforma.id} - {proforma.cliente?.nombre} {proforma.cliente?.apellidos} - Bs {parseFloat(proforma.total).toFixed(2)}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.proformaId}</FormErrorMessage>
              </FormControl>

              {selectedProforma && (
                <Box w="100%" p={4} bg="blue.50" borderRadius="md">
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Text fontWeight="bold">Proforma #{selectedProforma.id}</Text>
                      <Badge colorScheme="green">{selectedProforma.estado}</Badge>
                    </HStack>
                    <Text fontSize="sm">
                      Cliente: {selectedProforma.cliente?.nombre} {selectedProforma.cliente?.apellidos}
                    </Text>
                    <Text fontSize="sm">
                      Fecha: {new Date(selectedProforma.fecha).toLocaleDateString('es-ES')}
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      Total: Bs {parseFloat(selectedProforma.total).toFixed(2)}
                    </Text>
                  </VStack>
                </Box>
              )}

              <FormControl isInvalid={errors.clienteCi} isRequired>
                <FormLabel>Cliente</FormLabel>
                <Select
                  name="clienteCi"
                  value={formData.clienteCi}
                  onChange={handleChange}
                  placeholder="Seleccionar cliente"
                  isDisabled={!!formData.proformaId || !!factura}
                >
                  {clientes.map(cliente => (
                    <option key={cliente.ci} value={cliente.ci}>
                      {cliente.nombre} {cliente.apellidos} - CI: {cliente.ci}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.clienteCi}</FormErrorMessage>
              </FormControl>

              {!selectedProforma && formData.clienteCi && (
                <Box w="100%" p={3} bg="yellow.50" borderRadius="md">
                  <Text fontSize="sm" color="yellow.800">
                    ⚠️ Sin proforma seleccionada. El total será 0.00
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="teal"
              type="submit"
              isLoading={loading}
            >
              {factura ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default FacturaModal
