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
  Icon,
  Progress,
  Tooltip
} from '@chakra-ui/react';
import { FaUserTie, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { API_URL } from '../../config';

const ReporteActividadEmpleados = () => {
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
        `${API_URL}/reportes/actividad-empleados?mes=${mes}&anio=${anio}`,
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
      `${API_URL}/reportes/export/actividad-empleados-excel?mes=${mes}&anio=${anio}&token=${token}`,
      '_blank'
    );
  };

  const exportarPDF = () => {
    const token = localStorage.getItem('token');
    window.open(
      `${API_URL}/reportes/export/actividad-empleados-pdf?mes=${mes}&anio=${anio}&token=${token}`,
      '_blank'
    );
  };

  const getColorEficiencia = (eficiencia) => {
    const ef = parseFloat(eficiencia);
    if (ef >= 80) return 'green';
    if (ef >= 50) return 'yellow';
    return 'red';
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <HStack>
              <Icon as={FaUserTie} boxSize={6} color="orange.500" />
              <Heading size="md">Reporte de Actividad de Empleados</Heading>
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
                  colorScheme="orange" 
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
                  <StatLabel>Total Empleados</StatLabel>
                  <StatNumber fontSize="2xl">{datos.totalEmpleados}</StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Empleado Más Activo</StatLabel>
                  <StatNumber fontSize="lg">
                    {datos.empleados[0]?.empleado || 'N/A'}
                  </StatNumber>
                  <Text fontSize="sm" color="gray.600">
                    {datos.empleados[0]?.totalActividades || 0} actividades
                  </Text>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {loading && (
          <Card>
            <CardBody>
              <VStack py={10}>
                <Spinner size="xl" color="orange.500" thickness="4px" />
                <Text>Generando reporte...</Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {datos && !loading && (
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="sm">Actividad de Empleados</Heading>
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
                      <Th>CI</Th>
                      <Th>Empleado</Th>
                      <Th>Teléfono</Th>
                      <Th isNumeric>Órdenes</Th>
                      <Th isNumeric>Diagnósticos</Th>
                      <Th isNumeric>Total</Th>
                      <Th isNumeric>Finalizadas</Th>
                      <Th isNumeric>En Proceso</Th>
                      <Th isNumeric>Abiertas</Th>
                      <Th>Eficiencia</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {datos.empleados.map((empleado, index) => (
                      <Tr key={index} _hover={{ bg: 'gray.50' }}>
                        <Td>{index + 1}</Td>
                        <Td fontWeight="medium">{empleado.ci}</Td>
                        <Td>{empleado.empleado}</Td>
                        <Td>{empleado.telefono}</Td>
                        <Td isNumeric>
                          <Badge colorScheme="blue">{empleado.totalOrdenes}</Badge>
                        </Td>
                        <Td isNumeric>
                          <Badge colorScheme="purple">{empleado.totalDiagnosticos}</Badge>
                        </Td>
                        <Td isNumeric>
                          <Badge colorScheme="orange" fontSize="sm">
                            {empleado.totalActividades}
                          </Badge>
                        </Td>
                        <Td isNumeric>
                          <Badge colorScheme="green">{empleado.finalizadas}</Badge>
                        </Td>
                        <Td isNumeric>
                          <Badge colorScheme="yellow">{empleado.enProceso}</Badge>
                        </Td>
                        <Td isNumeric>
                          <Badge colorScheme="gray">{empleado.abiertas}</Badge>
                        </Td>
                        <Td>
                          <Tooltip label={`${empleado.eficiencia}% de eficiencia`}>
                            <Box>
                              <Progress
                                value={parseFloat(empleado.eficiencia)}
                                colorScheme={getColorEficiencia(empleado.eficiencia)}
                                size="sm"
                                borderRadius="md"
                                width="80px"
                              />
                              <Text fontSize="xs" mt={1} textAlign="center">
                                {empleado.eficiencia}%
                              </Text>
                            </Box>
                          </Tooltip>
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
                <Icon as={FaUserTie} boxSize={16} color="gray.300" />
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

export default ReporteActividadEmpleados;
