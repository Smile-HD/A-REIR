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
  useToast,
  Spinner,
  Text,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  Icon,
  Progress
} from '@chakra-ui/react';
import { FaDollarSign, FaChartLine, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { API_URL } from '../../config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReporteIngresosMensuales = () => {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const cargarReporte = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/reportes/ingresos-mensuales?anio=${anio}`,
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
      `${API_URL}/reportes/export/ingresos-excel?anio=${anio}&token=${token}`,
      '_blank'
    );
  };

  const exportarPDF = () => {
    const token = localStorage.getItem('token');
    window.open(
      `${API_URL}/reportes/export/ingresos-pdf?anio=${anio}&token=${token}`,
      '_blank'
    );
  };

  const chartData = datos ? {
    labels: datos.ingresos.map(i => i.mes),
    datasets: [
      {
        label: 'Ingresos (Bs)',
        data: datos.ingresos.map(i => parseFloat(i.ingresoTotal)),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Ingresos Mensuales ${anio}`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'Bs ' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <HStack>
              <Icon as={FaDollarSign} boxSize={6} color="green.500" />
              <Heading size="md">Reporte de Ingresos Mensuales</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <HStack spacing={4}>
              <Box>
                <Text fontSize="sm" mb={1} fontWeight="medium">Año</Text>
                <Select value={anio} onChange={(e) => setAnio(e.target.value)} width="150px">
                  {[2023, 2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Select>
              </Box>

              <Box pt={6}>
                <Button 
                  colorScheme="green" 
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
          <>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Año</StatLabel>
                    <StatNumber fontSize="3xl">{datos.anio}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg="green.50">
                <CardBody>
                  <Stat>
                    <StatLabel>Ingreso Total Anual</StatLabel>
                    <StatNumber fontSize="3xl" color="green.600">
                      Bs {parseFloat(datos.totalAnual).toLocaleString('es-ES', {minimumFractionDigits: 2})}
                    </StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Card>
              <CardHeader>
                <HStack justify="space-between">
                  <HStack>
                    <Icon as={FaChartLine} color="blue.500" />
                    <Heading size="sm">Gráfico de Ingresos Mensuales</Heading>
                  </HStack>
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
                <Bar data={chartData} options={chartOptions} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size="sm">Desglose Mensual</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {datos.ingresos.map((mes, index) => {
                    const porcentaje = (parseFloat(mes.ingresoTotal) / parseFloat(datos.totalAnual)) * 100;
                    return (
                      <Box key={index}>
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="medium" textTransform="capitalize">{mes.mes}</Text>
                          <HStack>
                            <Text fontSize="sm" color="gray.600">
                              {mes.totalProformas} proformas
                            </Text>
                            <Text fontWeight="bold" color="green.600">
                              Bs {parseFloat(mes.ingresoTotal).toLocaleString('es-ES', {minimumFractionDigits: 2})}
                            </Text>
                          </HStack>
                        </HStack>
                        <Progress 
                          value={porcentaje} 
                          colorScheme="green" 
                          size="sm" 
                          borderRadius="md"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {porcentaje.toFixed(1)}% del total anual
                        </Text>
                      </Box>
                    );
                  })}
                </VStack>
              </CardBody>
            </Card>
          </>
        )}

        {loading && (
          <Card>
            <CardBody>
              <VStack py={10}>
                <Spinner size="xl" color="green.500" thickness="4px" />
                <Text>Generando reporte...</Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {!datos && !loading && (
          <Card>
            <CardBody>
              <VStack py={10} spacing={3}>
                <Icon as={FaDollarSign} boxSize={16} color="gray.300" />
                <Text color="gray.500" fontSize="lg">
                  Selecciona un año y genera el reporte
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default ReporteIngresosMensuales;
