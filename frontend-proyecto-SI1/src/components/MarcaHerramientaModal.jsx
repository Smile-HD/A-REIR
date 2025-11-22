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
  VStack,
  useToast
} from '@chakra-ui/react';

const MarcaHerramientaModal = ({ isOpen, onClose, marca, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: ''
  });
  const toast = useToast();

  useEffect(() => {
    if (marca) {
      setFormData({
        nombre: marca.nombre || ''
      });
    } else {
      setFormData({
        nombre: ''
      });
    }
  }, [marca]);

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
        description: 'El nombre de la marca es obligatorio',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{marca ? 'Editar' : 'Nueva'} Marca de Herramienta</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nombre de la Marca</FormLabel>
              <Input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: DeWalt, Bosch, Stanley"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="teal" onClick={handleSubmit}>
            {marca ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MarcaHerramientaModal;
