import { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  SimpleGrid,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Spinner,
  Text,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import { FaFileExcel, FaFilePdf, FaUsers } from 'react-icons/fa';
import { API_URL } from '../../config';

const ReporteClientesFrecuentes = () => {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const cargarReporte = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/reportes/clientes-frecuentes?mes=${mes}&anio=${anio}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar el reporte');
      }

      const data = await response.json();
      setDatos(data);
      toast({
        title: 'Reporte generado',
        description: 'El reporte se ha cargado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error cargando reporte:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar el reporte',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    const token = localStorage.getItem('token');
    window.open(
      `${API_URL}/reportes/export/clientes-excel?mes=${mes}&anio=${anio}&token=${token}`,
      '_blank'
    );
  };

  const exportarPDF = () => {
    const token = localStorage.getItem('token');
    window.open(
      `${API_URL}/reportes/export/clientes-pdf?mes=${mes}&anio=${anio}&token=${token}`,
      '_blank'
    );
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Encabezado */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <HStack>
                <Icon as={FaUsers} boxSize={6} color="teal.500" />
                <Heading size="md">Reporte de Clientes Frecuentes</Heading>
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <Box>
                <Text fontSize="sm" mb={1} fontWeight="medium">Mes</Text>
                <Select 
                  value={mes} 
                  onChange={(e) => setMes(e.target.value)}
                  width="200px"
                >
                  {meses.map((mes, index) => (
                    <option key={index + 1} value={index + 1}>
                      {mes}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" mb={1} fontWeight="medium">Año</Text>
                <Select
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  width="150px"
                >
                  {[2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Select>
              </Box>

              <Box pt={6}>
                <Button 
                  colorScheme="teal" 
                  onClick={cargarReporte}
                  isLoading={loading}
                  loadingText="Generando..."
                >
                  Generar Reporte
                </Button>
              </Box>

              {datos && (
                <>
                  <Box pt={6}>
                    <Button 
                      leftIcon={<FaFileExcel />}
                      colorScheme="green"
                      onClick={exportarExcel}
                      size="md"
                    >
                      Excel
                    </Button>
                  </Box>
                  <Box pt={6}>
                    <Button 
                      leftIcon={<FaFilePdf />}
                      colorScheme="red"
                      onClick={exportarPDF}
                      size="md"
                    >
                      PDF
                    </Button>
                  </Box>
                </>
              )}
            </HStack>
          </CardBody>
        </Card>

        {/* Estadísticas */}
        {datos && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Período</StatLabel>
                  <StatNumber fontSize="2xl">{datos.mesNombre} {datos.anio}</StatNumber>
                  <StatHelpText>Mes seleccionado</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Clientes</StatLabel>
                  <StatNumber fontSize="2xl">{datos.totalClientes}</StatNumber>
                  <StatHelpText>Clientes con visitas</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Cliente Top</StatLabel>
                  <StatNumber fontSize="lg">
                    {datos.clientes[0]?.cliente || 'N/A'}
                  </StatNumber>
                  <StatHelpText>
                    {datos.clientes[0]?.totalVisitas || 0} visitas
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Loading */}
        {loading && (
          <Card>
            <CardBody>
              <VStack py={10}>
                <Spinner size="xl" color="teal.500" thickness="4px" />
                <Text>Generando reporte...</Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Tabla de Datos */}
        {datos && !loading && (
          <Card>
            <CardHeader>
              <Heading size="sm">Top 10 Clientes Frecuentes</Heading>
            </CardHeader>
            <CardBody>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>#</Th>
                      <Th>CI</Th>
                      <Th>Cliente</Th>
                      <Th>Teléfono</Th>
                      <Th isNumeric>Visitas</Th>
                      <Th isNumeric>Total Gastado</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {datos.clientes.map((cliente, index) => (
                      <Tr key={index} _hover={{ bg: 'gray.50' }}>
                        <Td>{index + 1}</Td>
                        <Td>{cliente.ci}</Td>
                        <Td fontWeight="medium">{cliente.cliente}</Td>
                        <Td>{cliente.telefono}</Td>
                        <Td isNumeric>
                          <Badge colorScheme="teal" fontSize="sm">
                            {cliente.totalVisitas}
                          </Badge>
                        </Td>
                        <Td isNumeric fontWeight="bold" color="green.600">
                          Bs {parseFloat(cliente.totalGastado).toFixed(2)}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        )}

        {/* Estado vacío */}
        {!datos && !loading && (
          <Card>
            <CardBody>
              <VStack py={10} spacing={3}>
                <Icon as={FaUsers} boxSize={16} color="gray.300" />
                <Text color="gray.500" fontSize="lg">
                  Selecciona un período y genera el reporte
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default ReporteClientesFrecuentes;
