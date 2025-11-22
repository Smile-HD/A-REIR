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
  InputLeftElement,
  Select,
  Text,
  Tooltip
} from '@chakra-ui/react';
import { FaPlus, FaEllipsisV, FaEdit, FaTrash, FaSearch, FaTools } from "react-icons/fa";
import HerramientaModal from "../../components/HerramientaModal";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import { API_URL } from "../../config";

const GestionHerramientas = () => {
  const [herramientas, setHerramientas] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [selectedHerramienta, setSelectedHerramienta] = useState(null);
  const [herramientaToDelete, setHerramientaToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [marcaFilter, setMarcaFilter] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchHerramientas();
    fetchMarcas();
  }, []);

  const fetchHerramientas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/herramientas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener herramientas');
      }
      
      const data = await response.json();
      setHerramientas(data);
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

  const fetchMarcas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/marcas-herramienta`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener marcas');
      }
      
      const data = await response.json();
      setMarcas(data);
    } catch (error) {
      console.error('Error al cargar marcas:', error);
    }
  };

  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedHerramienta 
        ? `${API_URL}/herramientas/${selectedHerramienta.id}`
        : `${API_URL}/herramientas`;
      
      const method = selectedHerramienta ? 'PUT' : 'POST';
      
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
        throw new Error(error.error || 'Error al guardar herramienta');
      }

      toast({
        title: 'Éxito',
        description: `Herramienta ${selectedHerramienta ? 'actualizada' : 'creada'} correctamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchHerramientas();
      onClose();
      setSelectedHerramienta(null);
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

  const handleEdit = (herramienta) => {
    setSelectedHerramienta(herramienta);
    onOpen();
  };

  const handleDeleteClick = (herramienta) => {
    setHerramientaToDelete(herramienta);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/herramientas/${herramientaToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar herramienta');
      }

      toast({
        title: 'Éxito',
        description: 'Herramienta eliminada correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchHerramientas();
      onDeleteClose();
      setHerramientaToDelete(null);
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
    setSelectedHerramienta(null);
    onClose();
  };

  const filteredHerramientas = herramientas.filter(herr => {
    const matchesSearch = herr.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         herr.marca?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMarca = !marcaFilter || herr.marcaId === parseInt(marcaFilter);
    return matchesSearch && matchesMarca;
  });

  return (
    <Box p={8}>
      <HStack justifyContent="space-between" mb={6}>
        <Heading size="lg">Gestión de Herramientas</Heading>
        <Button
          leftIcon={<FaPlus />}
          colorScheme="teal"
          onClick={onOpen}
        >
          Nueva Herramienta
        </Button>
      </HStack>

      <HStack mb={4} spacing={4}>
        <InputGroup flex={2}>
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray" />
          </InputLeftElement>
          <Input
            placeholder="Buscar por nombre o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Select
          flex={1}
          placeholder="Todas las marcas"
          value={marcaFilter}
          onChange={(e) => setMarcaFilter(e.target.value)}
        >
          {marcas.map((marca) => (
            <option key={marca.id} value={marca.id}>
              {marca.nombre}
            </option>
          ))}
        </Select>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Nombre</Th>
            <Th>Descripción</Th>
            <Th>Marca</Th>
            <Th isNumeric>Movimientos</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredHerramientas.map((herr) => (
            <Tr key={herr.id}>
              <Td>{herr.id}</Td>
              <Td fontWeight="bold">
                <HStack>
                  <FaTools />
                  <span>{herr.nombre}</span>
                </HStack>
              </Td>
              <Td>
                {herr.descripcion ? (
                  <Tooltip label={herr.descripcion}>
                    <Text isTruncated maxW="200px">
                      {herr.descripcion}
                    </Text>
                  </Tooltip>
                ) : (
                  <Text color="gray.400" fontSize="sm">Sin descripción</Text>
                )}
              </Td>
              <Td>
                <Badge colorScheme="purple">
                  {herr.marca?.nombre}
                </Badge>
              </Td>
              <Td isNumeric>
                <Badge colorScheme={herr._count?.movimientos > 0 ? 'teal' : 'gray'}>
                  {herr._count?.movimientos || 0}
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
                    <MenuItem icon={<FaEdit />} onClick={() => handleEdit(herr)}>
                      Editar
                    </MenuItem>
                    <MenuItem 
                      icon={<FaTrash />} 
                      onClick={() => handleDeleteClick(herr)}
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

      <HerramientaModal
        isOpen={isOpen}
        onClose={handleModalClose}
        herramienta={selectedHerramienta}
        marcas={marcas}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
        title="Eliminar Herramienta"
        message={`¿Está seguro de que desea eliminar la herramienta "${herramientaToDelete?.nombre}"?`}
      />
    </Box>
  );
};

export default GestionHerramientas;
