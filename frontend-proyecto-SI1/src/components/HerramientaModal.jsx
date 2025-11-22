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
  Textarea,
  Select,
  VStack,
  useToast
} from '@chakra-ui/react';

const HerramientaModal = ({ isOpen, onClose, herramienta, marcas, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    marcaId: ''
  });
  const toast = useToast();

  useEffect(() => {
    if (herramienta) {
      setFormData({
        nombre: herramienta.nombre || '',
        descripcion: herramienta.descripcion || '',
        marcaId: herramienta.marcaId?.toString() || ''
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        marcaId: ''
      });
    }
  }, [herramienta]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      toast({
        title: 'Error de validación',
        description: 'El nombre de la herramienta es obligatorio',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.marcaId) {
      toast({
        title: 'Error de validación',
        description: 'Debe seleccionar una marca',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onSave({
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      marcaId: parseInt(formData.marcaId)
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{herramienta ? 'Editar' : 'Nueva'} Herramienta</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nombre de la Herramienta</FormLabel>
              <Input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Taladro eléctrico, Llave inglesa"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Descripción</FormLabel>
              <Textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción opcional de la herramienta"
                rows={3}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Marca</FormLabel>
              <Select
                name="marcaId"
                value={formData.marcaId}
                onChange={handleChange}
                placeholder="Seleccione una marca"
              >
                {marcas.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
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
          <Button colorScheme="teal" onClick={handleSubmit}>
            {herramienta ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default HerramientaModal;
