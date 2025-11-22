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
import { FaTools, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { API_URL } from '../../config';

const ReporteServiciosSolicitados = () => {
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
        `${API_URL}/reportes/servicios-solicitados?mes=${mes}&anio=${anio}`,
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
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
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
      `${API_URL}/reportes/export/servicios-excel?mes=${mes}&anio=${anio}&token=${token}`,
      '_blank'
    );
  };

  const exportarPDF = () => {
    const token = localStorage.getItem('token');
    window.open(
      `${API_URL}/reportes/export/servicios-pdf?mes=${mes}&anio=${anio}&token=${token}`,
      '_blank'
    );
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <HStack>
              <Icon as={FaTools} boxSize={6} color="purple.500" />
              <Heading size="md">Reporte de Servicios Más Solicitados</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <Box>
                <Text fontSize="sm" mb={1} fontWeight="medium">Mes</Text>
                <Select value={mes} onChange={(e) => setMes(e.target.value)} width="200px">
                  {meses.map((mes, index) => (
                    <option key={index + 1} value={index + 1}>{mes}</option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" mb={1} fontWeight="medium">Año</Text>
                <Select value={anio} onChange={(e) => setAnio(e.target.value)} width="150px">
                  {[2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Select>
              </Box>

              <Box pt={6}>
                <Button 
                  colorScheme="purple" 
                  onClick={cargarReporte}
                  isLoading={loading}
                >
                  Generar Reporte
                </Button>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        {datos && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Período</StatLabel>
                  <StatNumber fontSize="2xl">{datos.mesNombre} {datos.anio}</StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Servicios</StatLabel>
                  <StatNumber fontSize="2xl">{datos.totalServicios}</StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Servicio Top</StatLabel>
                  <StatNumber fontSize="lg">
                    {datos.servicios[0]?.servicio || 'N/A'}
                  </StatNumber>
                  <StatHelpText>
                    {datos.servicios[0]?.vecessolicitado || 0} veces
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {loading && (
          <Card>
            <CardBody>
              <VStack py={10}>
                <Spinner size="xl" color="purple.500" thickness="4px" />
                <Text>Generando reporte...</Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {datos && !loading && (
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="sm">Servicios Solicitados</Heading>
                <HStack>
                  <Button
                    leftIcon={<FaFileExcel />}
                    colorScheme="green"
                    size="sm"
                    onClick={exportarExcel}
                    isDisabled={!datos}
                  >
                    Excel
                  </Button>
                  <Button
                    leftIcon={<FaFilePdf />}
                    colorScheme="red"
                    size="sm"
                    onClick={exportarPDF}
                    isDisabled={!datos}
                  >
                    PDF
                  </Button>
                </HStack>
              </HStack>
            </CardHeader>
            <CardBody>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>#</Th>
                      <Th>Servicio</Th>
                      <Th>Categoría</Th>
                      <Th isNumeric>Veces Solicitado</Th>
                      <Th isNumeric>Cantidad Total</Th>
                      <Th isNumeric>Ingreso Total</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {datos.servicios.map((servicio, index) => (
                      <Tr key={index} _hover={{ bg: 'gray.50' }}>
                        <Td>{index + 1}</Td>
                        <Td fontWeight="medium">{servicio.servicio}</Td>
                        <Td>
                          <Badge colorScheme="purple">{servicio.categoria}</Badge>
                        </Td>
                        <Td isNumeric>
                          <Badge colorScheme="blue" fontSize="sm">
                            {servicio.vecessolicitado}
                          </Badge>
                        </Td>
                        <Td isNumeric>{parseFloat(servicio.cantidadTotal).toFixed(2)}</Td>
                        <Td isNumeric fontWeight="bold" color="green.600">
                          Bs {parseFloat(servicio.ingresoTotal).toFixed(2)}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        )}

        {!datos && !loading && (
          <Card>
            <CardBody>
              <VStack py={10} spacing={3}>
                <Icon as={FaTools} boxSize={16} color="gray.300" />
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

export default ReporteServiciosSolicitados;
