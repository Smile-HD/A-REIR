import { useState, useEffect } from 'react';
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  Text,
  Box,
  Badge,
  useToast
} from '@chakra-ui/react';

const MovimientoHerramientaModal = ({ isOpen, onClose, movimiento, ordenes, herramientas, onSave }) => {
  const [formData, setFormData] = useState({
    ordenTrabajoId: '',
    herramientaId: '',
    fecha: '',
    cantidad: 1
  });
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [selectedHerramienta, setSelectedHerramienta] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (movimiento) {
      setFormData({
        ordenTrabajoId: movimiento.ordenTrabajoId?.toString() || '',
        herramientaId: movimiento.herramientaId?.toString() || '',
        fecha: movimiento.fecha ? new Date(movimiento.fecha).toISOString().split('T')[0] : '',
        cantidad: movimiento.cantidad || 1
      });
      
      if (movimiento.ordenTrabajo) {
        setSelectedOrden(movimiento.ordenTrabajo);
      }
      if (movimiento.herramienta) {
        setSelectedHerramienta(movimiento.herramienta);
      }
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        ordenTrabajoId: '',
        herramientaId: '',
        fecha: today,
        cantidad: 1
      });
      setSelectedOrden(null);
      setSelectedHerramienta(null);
    }
  }, [movimiento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'ordenTrabajoId') {
      const orden = ordenes.find(o => o.id === parseInt(value));
      setSelectedOrden(orden);
    } else if (name === 'herramientaId') {
      const herr = herramientas.find(h => h.id === parseInt(value));
      setSelectedHerramienta(herr);
    }
  };

  const handleCantidadChange = (valueString, valueNumber) => {
    setFormData({
      ...formData,
      cantidad: valueNumber
    });
  };

  const handleSubmit = () => {
    // Validaciones
    if (!formData.ordenTrabajoId) {
      toast({
        title: 'Error de validación',
        description: 'Debe seleccionar una orden de trabajo',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.herramientaId) {
      toast({
        title: 'Error de validación',
        description: 'Debe seleccionar una herramienta',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      toast({
        title: 'Error de validación',
        description: 'La cantidad debe ser mayor a 0',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.fecha) {
      toast({
        title: 'Error de validación',
        description: 'La fecha es obligatoria',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validar que la fecha no sea futura
    const fechaSeleccionada = new Date(formData.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada > hoy) {
      toast({
        title: 'Error de validación',
        description: 'La fecha del movimiento no puede ser futura',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onSave({
      ordenTrabajoId: parseInt(formData.ordenTrabajoId),
      herramientaId: parseInt(formData.herramientaId),
      fecha: formData.fecha,
      cantidad: formData.cantidad
    });
  };

  const getEstadoBadge = (estado) => {
    const colors = {
      ABIERTA: 'blue',
      EN_PROCESO: 'yellow',
      FINALIZADA: 'green',
      CANCELADA: 'red'
    };
    return <Badge colorScheme={colors[estado] || 'gray'}>{estado}</Badge>;
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{movimiento ? 'Editar' : 'Nuevo'} Movimiento de Herramienta</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Orden de Trabajo</FormLabel>
              <Select
                name="ordenTrabajoId"
                value={formData.ordenTrabajoId}
                onChange={handleChange}
                placeholder="Seleccione una orden de trabajo"
                isDisabled={!!movimiento}
              >
                {ordenes.map((orden) => (
                  <option key={orden.id} value={orden.id}>
                    #{orden.id} - {orden.empleado?.nombre} {orden.empleado?.apellidos} - {getEstadoBadge(orden.estado).props.children}
                  </option>
                ))}
              </Select>
            </FormControl>

            {selectedOrden && (
              <Box p={3} bg="gray.50" borderRadius="md" w="full">
                <Text fontSize="sm" fontWeight="bold">Detalles de la orden:</Text>
                <Text fontSize="sm">Empleado: {selectedOrden.empleado?.nombre} {selectedOrden.empleado?.apellidos}</Text>
                <Text fontSize="sm">Fecha Inicio: {new Date(selectedOrden.fechaInicio).toLocaleDateString()}</Text>
                {selectedOrden.fechaFin && (
                  <Text fontSize="sm">Fecha Fin: {new Date(selectedOrden.fechaFin).toLocaleDateString()}</Text>
                )}
                {selectedOrden.detalle?.servicio && (
                  <Text fontSize="sm">Servicio: {selectedOrden.detalle.servicio.descripcion}</Text>
                )}
                <Text fontSize="sm">Estado: {getEstadoBadge(selectedOrden.estado)}</Text>
              </Box>
            )}

            <FormControl isRequired>
              <FormLabel>Herramienta</FormLabel>
              <Select
                name="herramientaId"
                value={formData.herramientaId}
                onChange={handleChange}
                placeholder="Seleccione una herramienta"
                isDisabled={!!movimiento}
              >
                {herramientas.map((herr) => (
                  <option key={herr.id} value={herr.id}>
                    {herr.nombre} - {herr.marca?.nombre}
                  </option>
                ))}
              </Select>
            </FormControl>

            {selectedHerramienta && (
              <Box p={3} bg="gray.50" borderRadius="md" w="full">
                <Text fontSize="sm" fontWeight="bold">Detalles de la herramienta:</Text>
                <Text fontSize="sm">Nombre: {selectedHerramienta.nombre}</Text>
                <Text fontSize="sm">Marca: {selectedHerramienta.marca?.nombre}</Text>
                {selectedHerramienta.descripcion && (
                  <Text fontSize="sm">Descripción: {selectedHerramienta.descripcion}</Text>
                )}
              </Box>
            )}

            <FormControl isRequired>
              <FormLabel>Fecha del Movimiento</FormLabel>
              <Input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                max={today}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Cantidad</FormLabel>
              <NumberInput
                value={formData.cantidad}
                onChange={handleCantidadChange}
                min={1}
                step={1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="teal" onClick={handleSubmit}>
            {movimiento ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MovimientoHerramientaModal;
