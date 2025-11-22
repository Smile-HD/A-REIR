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
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  SimpleGrid
} from '@chakra-ui/react';
import { FaPlus, FaEllipsisV, FaEdit, FaTrash, FaSearch, FaExchangeAlt } from "react-icons/fa";
import MovimientoHerramientaModal from "../../components/MovimientoHerramientaModal";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import { API_URL } from "../../config";

const GestionMovimientosHerramienta = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [herramientas, setHerramientas] = useState([]);
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [movimientoToDelete, setMovimientoToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ordenFilter, setOrdenFilter] = useState('');
  const [herramientaFilter, setHerramientaFilter] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();


  useEffect(() => {
    fetchMovimientos();
    fetchOrdenes();
    fetchHerramientas();
  }, []);

  const fetchMovimientos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/movimientos-herramienta`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener movimientos');
      }
      
      const data = await response.json();
      // Validar que data sea un array antes de establecer el estado
      setMovimientos(Array.isArray(data) ? data : []);
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

  const fetchOrdenes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/ordenes-trabajo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener órdenes');
      }
      
      const data = await response.json();
      setOrdenes(data);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    }
  };

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
      console.error('Error al cargar herramientas:', error);
    }
  };

  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedMovimiento 
        ? `${API_URL}/movimientos-herramienta/${selectedMovimiento.ordenTrabajoId}/${selectedMovimiento.herramientaId}`
        : `${API_URL}/movimientos-herramienta`;
      
      const method = selectedMovimiento ? 'PUT' : 'POST';
      
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
        throw new Error(error.error || 'Error al guardar movimiento');
      }

      toast({
        title: 'Éxito',
        description: `Movimiento ${selectedMovimiento ? 'actualizado' : 'creado'} correctamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchMovimientos();
      onClose();
      setSelectedMovimiento(null);
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

  const handleEdit = (movimiento) => {
    setSelectedMovimiento(movimiento);
    onOpen();
  };

  const handleDeleteClick = (movimiento) => {
    setMovimientoToDelete(movimiento);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/movimientos-herramienta/${movimientoToDelete.ordenTrabajoId}/${movimientoToDelete.herramientaId}`, 
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar movimiento');
      }

      toast({
        title: 'Éxito',
        description: 'Movimiento eliminado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchMovimientos();
      onDeleteClose();
      setMovimientoToDelete(null);
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
    setSelectedMovimiento(null);
    onClose();
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

  // Validación defensiva para evitar errores si movimientos no es un array
  const filteredMovimientos = (Array.isArray(movimientos) ? movimientos : []).filter(mov => {
    const searchMatch = 
      mov.herramienta?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.ordenTrabajo?.empleado?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.ordenTrabajo?.empleado?.apellidos.toLowerCase().includes(searchTerm.toLowerCase());
    
    const ordenMatch = !ordenFilter || mov.ordenTrabajoId === parseInt(ordenFilter);
    const herramientaMatch = !herramientaFilter || mov.herramientaId === parseInt(herramientaFilter);
    
    return searchMatch && ordenMatch && herramientaMatch;
  });

  // Estadísticas con validación defensiva
  const movimientosArray = Array.isArray(movimientos) ? movimientos : [];
  const totalMovimientos = movimientosArray.length;
  const totalCantidad = movimientosArray.reduce((sum, mov) => sum + mov.cantidad, 0);
  const herramientasUsadas = new Set(movimientosArray.map(m => m.herramientaId)).size;

  return (
    <Box p={8}>
      <HStack justifyContent="space-between" mb={6}>
        <Heading size="lg">Gestión de Movimientos de Herramientas</Heading>
        <Button
          leftIcon={<FaPlus />}
          colorScheme="teal"
          onClick={onOpen}
        >
          Nuevo Movimiento
        </Button>
      </HStack>

      {/* Estadísticas */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Stat bg="blue.50" p={4} borderRadius="md">
          <StatLabel>Total Movimientos</StatLabel>
          <StatNumber color="blue.600">{totalMovimientos}</StatNumber>
        </Stat>
        <Stat bg="green.50" p={4} borderRadius="md">
          <StatLabel>Cantidad Total</StatLabel>
          <StatNumber color="green.600">{totalCantidad}</StatNumber>
        </Stat>
        <Stat bg="purple.50" p={4} borderRadius="md">
          <StatLabel>Herramientas Usadas</StatLabel>
          <StatNumber color="purple.600">{herramientasUsadas}</StatNumber>
        </Stat>
      </SimpleGrid>

      {/* Filtros */}
      <VStack spacing={4} mb={4}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray" />
          </InputLeftElement>
          <Input
            placeholder="Buscar por herramienta o empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <HStack w="full" spacing={4}>
          <Select
            flex={1}
            placeholder="Todas las órdenes"
            value={ordenFilter}
            onChange={(e) => setOrdenFilter(e.target.value)}
          >
            {ordenes.map((orden) => (
              <option key={orden.id} value={orden.id}>
                Orden #{orden.id} - {orden.empleado?.nombre}
              </option>
            ))}
          </Select>

          <Select
            flex={1}
            placeholder="Todas las herramientas"
            value={herramientaFilter}
            onChange={(e) => setHerramientaFilter(e.target.value)}
          >
            {herramientas.map((herr) => (
              <option key={herr.id} value={herr.id}>
                {herr.nombre} - {herr.marca?.nombre}
              </option>
            ))}
          </Select>
        </HStack>
      </VStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Orden</Th>
            <Th>Herramienta</Th>
            <Th>Marca</Th>
            <Th>Empleado</Th>
            <Th>Fecha</Th>
            <Th isNumeric>Cantidad</Th>
            <Th>Estado Orden</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredMovimientos.map((mov) => (
            <Tr key={`${mov.ordenTrabajoId}-${mov.herramientaId}`}>
              <Td>
                <Badge colorScheme="blue">#{mov.ordenTrabajoId}</Badge>
              </Td>
              <Td fontWeight="bold">
                <HStack>
                  <FaExchangeAlt />
                  <span>{mov.herramienta?.nombre}</span>
                </HStack>
              </Td>
              <Td>
                <Badge colorScheme="purple">
                  {mov.herramienta?.marca?.nombre}
                </Badge>
              </Td>
              <Td>
                {mov.ordenTrabajo?.empleado?.nombre} {mov.ordenTrabajo?.empleado?.apellidos}
              </Td>
              <Td>{new Date(mov.fecha).toLocaleDateString()}</Td>
              <Td isNumeric>
                <Badge colorScheme="teal" fontSize="md">
                  {mov.cantidad}
                </Badge>
              </Td>
              <Td>
                {getEstadoBadge(mov.ordenTrabajo?.estado)}
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
                    <MenuItem icon={<FaEdit />} onClick={() => handleEdit(mov)}>
                      Editar
                    </MenuItem>
                    <MenuItem 
                      icon={<FaTrash />} 
                      onClick={() => handleDeleteClick(mov)}
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

      <MovimientoHerramientaModal
        isOpen={isOpen}
        onClose={handleModalClose}
        movimiento={selectedMovimiento}
        ordenes={ordenes}
        herramientas={herramientas}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
        title="Eliminar Movimiento"
        message={`¿Está seguro de que desea eliminar este movimiento de herramienta?`}
      />
    </Box>
  );
};

export default GestionMovimientosHerramienta;
