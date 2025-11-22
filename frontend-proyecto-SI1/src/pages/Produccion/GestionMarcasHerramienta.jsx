import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  useToast,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Input,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import { FaPlus, FaEllipsisV, FaEdit, FaTrash, FaSearch, FaTools } from "react-icons/fa";
import MarcaHerramientaModal from "../../components/MarcaHerramientaModal";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import { API_URL } from "../../config";

const GestionMarcasHerramienta = () => {
  const [marcas, setMarcas] = useState([]);
  const [selectedMarca, setSelectedMarca] = useState(null);
  const [marcaToDelete, setMarcaToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();


  useEffect(() => {
    fetchMarcas();
  }, []);

  const fetchMarcas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/marcas-herramienta`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener marcas de herramientas');
      }
      
      const data = await response.json();
      setMarcas(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedMarca 
        ? `${API_URL}/marcas-herramienta/${selectedMarca.id}`
        : `${API_URL}/marcas-herramienta`;
      
      const method = selectedMarca ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar marca de herramienta');
      }

      toast({
        title: 'Éxito',
        description: `Marca ${selectedMarca ? 'actualizada' : 'creada'} correctamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchMarcas();
      onClose();
      setSelectedMarca(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (marca) => {
    setSelectedMarca(marca);
    onOpen();
  };

  const handleDeleteClick = (marca) => {
    setMarcaToDelete(marca);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/marcas-herramienta/${marcaToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar marca de herramienta');
      }

      toast({
        title: 'Éxito',
        description: 'Marca eliminada correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchMarcas();
      onDeleteClose();
      setMarcaToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleModalClose = () => {
    setSelectedMarca(null);
    onClose();
  };

  const filteredMarcas = marcas.filter(marca =>
    marca.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box p={8}>
      <HStack justifyContent="space-between" mb={6}>
        <Heading size="lg">Gestión de Marcas de Herramientas</Heading>
        <Button
          leftIcon={<FaPlus />}
          colorScheme="teal"
          onClick={onOpen}
        >
          Nueva Marca
        </Button>
      </HStack>

      <Box mb={4}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray" />
          </InputLeftElement>
          <Input
            placeholder="Buscar por nombre de marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Nombre</Th>
            <Th isNumeric>Herramientas</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredMarcas.map((marca) => (
            <Tr key={marca.id}>
              <Td>{marca.id}</Td>
              <Td fontWeight="bold">
                <HStack>
                  <FaTools />
                  <span>{marca.nombre}</span>
                </HStack>
              </Td>
              <Td isNumeric>
                <Badge colorScheme={marca._count?.herramientas > 0 ? 'teal' : 'gray'}>
                  {marca._count?.herramientas || 0}
                </Badge>
              </Td>
              <Td>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FaEllipsisV />}
                    variant="ghost"
                    size="sm"
                  />
                  <MenuList>
                    <MenuItem icon={<FaEdit />} onClick={() => handleEdit(marca)}>
                      Editar
                    </MenuItem>
                    <MenuItem 
                      icon={<FaTrash />} 
                      onClick={() => handleDeleteClick(marca)}
                      color="red.500"
                    >
                      Eliminar
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <MarcaHerramientaModal
        isOpen={isOpen}
        onClose={handleModalClose}
        marca={selectedMarca}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
        title="Eliminar Marca de Herramienta"
        message={`¿Está seguro de que desea eliminar la marca "${marcaToDelete?.nombre}"?`}
      />
    </Box>
  );
};

export default GestionMarcasHerramienta;
