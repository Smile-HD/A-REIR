import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  Icon,
  Spinner,
  Center,
  Avatar,
  Progress,
  Divider,
} from '@chakra-ui/react';
import { FaMoneyBillWave, FaUserTie, FaCheckCircle, FaClock } from 'react-icons/fa';
import { API_URL } from '../../config';

function CuentasPorPagar() {
  const [comisiones, setComisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    totalPendiente: 0,
    totalPagado: 0,
    empleadosConPendientes: 0
  });
  const toast = useToast();

  useEffect(() => {
    fetchComisiones();
  }, []);

  const fetchComisiones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/comisiones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener comisiones');
      }

      const data = await response.json();
      const comisionesArray = Array.isArray(data) ? data : [];
      setComisiones(comisionesArray);
      calcularEstadisticas(comisionesArray);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (comisionesData) => {
    const totalPendiente = comisionesData
      .filter(c => c.estadoPago === 'PENDIENTE')
      .reduce((sum, c) => sum + parseFloat(c.monto), 0);

    const totalPagado = comisionesData
      .filter(c => c.estadoPago === 'PAGADO')
      .reduce((sum, c) => sum + parseFloat(c.monto), 0);

    const empleadosUnicos = new Set(
      comisionesData
        .filter(c => c.estadoPago === 'PENDIENTE')
        .map(c => c.ordenTrabajo?.empleado?.ci)
    );

    setEstadisticas({
      totalPendiente,
      totalPagado,
      empleadosConPendientes: empleadosUnicos.size
    });
  };

  const agruparPorEmpleado = () => {
    const empleadosMap = new Map();

    comisiones.forEach(comision => {
      const empleado = comision.ordenTrabajo?.empleado;
      if (!empleado) return;

      const key = empleado.ci;
      if (!empleadosMap.has(key)) {
        empleadosMap.set(key, {
          empleado: empleado,
          comisionesPendientes: [],
          comisionesPagadas: [],
          totalPendiente: 0,
          totalPagado: 0,
          totalGeneral: 0
        });
      }

      const empleadoData = empleadosMap.get(key);
      const monto = parseFloat(comision.monto);

      if (comision.estadoPago === 'PENDIENTE') {
        empleadoData.comisionesPendientes.push(comision);
        empleadoData.totalPendiente += monto;
      } else if (comision.estadoPago === 'PAGADO') {
        empleadoData.comisionesPagadas.push(comision);
        empleadoData.totalPagado += monto;
      }

      empleadoData.totalGeneral += monto;
    });

    return Array.from(empleadosMap.values()).sort((a, b) => b.totalPendiente - a.totalPendiente);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const empleadosAgrupados = agruparPorEmpleado();

  if (loading) {
    return (
      <Center h="80vh">
        <Spinner size="xl" color="teal.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box p={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">
          <HStack>
            <Icon as={FaMoneyBillWave} />
            <Text>Cuentas por Pagar - Comisiones</Text>
          </HStack>
        </Heading>

        {/* Estadísticas Generales */}
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
          <GridItem>
            <Card bg="red.50" borderLeft="4px solid" borderColor="red.500">
              <CardBody>
                <Stat>
                  <StatLabel color="red.700">
                    <HStack>
                      <Icon as={FaClock} />
                      <Text>Total Pendiente de Pago</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="red.600">
                    {formatCurrency(estadisticas.totalPendiente)}
                  </StatNumber>
                  <StatHelpText>Debe pagarse a empleados</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg="green.50" borderLeft="4px solid" borderColor="green.500">
              <CardBody>
                <Stat>
                  <StatLabel color="green.700">
                    <HStack>
                      <Icon as={FaCheckCircle} />
                      <Text>Total Pagado</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="green.600">
                    {formatCurrency(estadisticas.totalPagado)}
                  </StatNumber>
                  <StatHelpText>Ya pagado a empleados</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg="blue.50" borderLeft="4px solid" borderColor="blue.500">
              <CardBody>
                <Stat>
                  <StatLabel color="blue.700">
                    <HStack>
                      <Icon as={FaUserTie} />
                      <Text>Empleados con Pendientes</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="blue.600">
                    {estadisticas.empleadosConPendientes}
                  </StatNumber>
                  <StatHelpText>Con comisiones por pagar</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Resumen por Empleado */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Resumen por Empleado</Heading>
            {empleadosAgrupados.length === 0 ? (
              <Center py={8}>
                <Text color="gray.500">No hay comisiones registradas</Text>
              </Center>
            ) : (
              <VStack spacing={4} align="stretch">
                {empleadosAgrupados.map((empleadoData, index) => (
                  <Card key={empleadoData.empleado.ci} variant="outline">
                    <CardBody>
                      <Grid templateColumns={{ base: '1fr', md: '2fr 3fr' }} gap={6}>
                        {/* Información del Empleado */}
                        <GridItem>
                          <HStack spacing={4}>
                            <Avatar
                              name={`${empleadoData.empleado.nombre} ${empleadoData.empleado.apellidos}`}
                              size="lg"
                              bg="teal.500"
                            />
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold" fontSize="lg">
                                {empleadoData.empleado.nombre} {empleadoData.empleado.apellidos}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                CI: {empleadoData.empleado.ci}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                Tel: {empleadoData.empleado.telefono}
                              </Text>
                            </VStack>
                          </HStack>
                        </GridItem>

                        {/* Estadísticas del Empleado */}
                        <GridItem>
                          <VStack align="stretch" spacing={3}>
                            {/* Total Pendiente */}
                            <Box
                              p={3}
                              bg={empleadoData.totalPendiente > 0 ? 'red.50' : 'gray.50'}
                              borderRadius="md"
                              borderLeft="4px solid"
                              borderColor={empleadoData.totalPendiente > 0 ? 'red.500' : 'gray.300'}
                            >
                              <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" color="gray.600">
                                    Comisiones Pendientes
                                  </Text>
                                  <Text fontSize="2xl" fontWeight="bold" color="red.600">
                                    {formatCurrency(empleadoData.totalPendiente)}
                                  </Text>
                                </VStack>
                                <Badge colorScheme="red" fontSize="md" px={3} py={1}>
                                  {empleadoData.comisionesPendientes.length} pendientes
                                </Badge>
                              </HStack>
                            </Box>

                            {/* Total Pagado */}
                            <Box p={3} bg="green.50" borderRadius="md" borderLeft="4px solid" borderColor="green.500">
                              <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" color="gray.600">
                                    Comisiones Pagadas
                                  </Text>
                                  <Text fontSize="xl" fontWeight="bold" color="green.600">
                                    {formatCurrency(empleadoData.totalPagado)}
                                  </Text>
                                </VStack>
                                <Badge colorScheme="green" fontSize="sm" px={2} py={1}>
                                  {empleadoData.comisionesPagadas.length} pagadas
                                </Badge>
                              </HStack>
                            </Box>

                            {/* Progreso de pagos */}
                            <Box>
                              <HStack justify="space-between" mb={2}>
                                <Text fontSize="xs" color="gray.600">
                                  Total generado: {formatCurrency(empleadoData.totalGeneral)}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {empleadoData.totalGeneral > 0
                                    ? `${((empleadoData.totalPagado / empleadoData.totalGeneral) * 100).toFixed(0)}% pagado`
                                    : '0% pagado'}
                                </Text>
                              </HStack>
                              <Progress
                                value={
                                  empleadoData.totalGeneral > 0
                                    ? (empleadoData.totalPagado / empleadoData.totalGeneral) * 100
                                    : 0
                                }
                                colorScheme="green"
                                size="sm"
                                borderRadius="full"
                              />
                            </Box>
                          </VStack>
                        </GridItem>
                      </Grid>

                      {/* Detalle de comisiones pendientes */}
                      {empleadoData.comisionesPendientes.length > 0 && (
                        <Box mt={4} pt={4} borderTop="1px solid" borderColor="gray.200">
                          <Text fontWeight="bold" fontSize="sm" mb={2} color="red.600">
                            Detalle de Comisiones Pendientes:
                          </Text>
                          <VStack align="stretch" spacing={2}>
                            {empleadoData.comisionesPendientes.map(comision => (
                              <HStack
                                key={comision.id}
                                p={2}
                                bg="red.50"
                                borderRadius="md"
                                justify="space-between"
                                fontSize="sm"
                              >
                                <HStack>
                                  <Text color="gray.700">
                                    Orden #{comision.ordenTrabajo?.id}
                                  </Text>
                                  <Text color="gray.500">
                                    - {new Date(comision.fechaPago).toLocaleDateString('es-ES')}
                                  </Text>
                                </HStack>
                                <Text fontWeight="bold" color="red.600">
                                  {formatCurrency(comision.monto)}
                                </Text>
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Tabla detallada opcional */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Tabla Detallada - Todas las Comisiones</Heading>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Empleado</Th>
                    <Th>Orden</Th>
                    <Th isNumeric>Monto</Th>
                    <Th>Estado</Th>
                    <Th>Fecha Pago</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {comisiones.map((comision) => (
                    <Tr key={comision.id} bg={comision.estadoPago === 'PENDIENTE' ? 'red.50' : 'white'}>
                      <Td>
                        <Text fontWeight="medium">
                          {comision.ordenTrabajo?.empleado?.nombre} {comision.ordenTrabajo?.empleado?.apellidos}
                        </Text>
                      </Td>
                      <Td>#{comision.ordenTrabajo?.id}</Td>
                      <Td isNumeric fontWeight="bold">
                        {formatCurrency(comision.monto)}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            comision.estadoPago === 'PAGADO' ? 'green' :
                            comision.estadoPago === 'PENDIENTE' ? 'red' : 'gray'
                          }
                        >
                          {comision.estadoPago}
                        </Badge>
                      </Td>
                      <Td>
                        {new Date(comision.fechaPago).toLocaleDateString('es-ES')}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}

export default CuentasPorPagar;
