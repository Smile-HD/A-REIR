import { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Text,
  Icon,
  VStack,
  HStack,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FaUsers, 
  FaTools, 
  FaDollarSign, 
  FaUserTie, 
  FaMotorcycle,
  FaChartBar
} from 'react-icons/fa';
import ReporteClientesFrecuentes from './ReporteClientesFrecuentes';
import ReporteServiciosSolicitados from './ReporteServiciosSolicitados';
import ReporteIngresosMensuales from './ReporteIngresosMensuales';
import ReporteActividadEmpleados from './ReporteActividadEmpleados';

const GestionReportes = () => {
  const [reporteActivo, setReporteActivo] = useState(null);
  const bgCard = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  const reportes = [
    {
      id: 'clientes',
      titulo: 'Clientes Frecuentes',
      descripcion: 'Top 10 clientes que más visitan el taller',
      icon: FaUsers,
      color: 'teal',
      component: ReporteClientesFrecuentes
    },
    {
      id: 'servicios',
      titulo: 'Servicios Solicitados',
      descripcion: 'Servicios más demandados por período',
      icon: FaTools,
      color: 'purple',
      component: ReporteServiciosSolicitados
    },
    {
      id: 'ingresos',
      titulo: 'Ingresos Mensuales',
      descripcion: 'Análisis de ingresos por mes y año',
      icon: FaDollarSign,
      color: 'green',
      component: ReporteIngresosMensuales
    },
    {
      id: 'empleados',
      titulo: 'Actividad de Empleados',
      descripcion: 'Productividad y eficiencia del personal',
      icon: FaUserTie,
      color: 'orange',
      component: ReporteActividadEmpleados
    }
  ];

  const ReporteComponente = reporteActivo 
    ? reportes.find(r => r.id === reporteActivo)?.component 
    : null;

  if (reporteActivo && ReporteComponente) {
    return (
      <Box>
        <HStack mb={6}>
          <Box 
            as="button"
            onClick={() => setReporteActivo(null)}
            color="teal.500"
            _hover={{ textDecor: 'underline' }}
            fontWeight="medium"
          >
            ← Volver a reportes
          </Box>
        </HStack>
        <ReporteComponente />
      </Box>
    );
  }

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Encabezado */}
        <Card>
          <CardBody>
            <HStack spacing={3}>
              <Icon as={FaChartBar} boxSize={8} color="teal.500" />
              <Box>
                <Heading size="lg">Módulo de Reportes</Heading>
                <Text color="gray.600" mt={1}>
                  Genera estadísticas y análisis de tu taller
                </Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        {/* Grid de Reportes */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {reportes.map((reporte) => (
            <Card
              key={reporte.id}
              bg={bgCard}
              _hover={{ 
                bg: hoverBg, 
                transform: 'translateY(-4px)',
                boxShadow: 'lg',
                cursor: 'pointer'
              }}
              transition="all 0.2s"
              onClick={() => setReporteActivo(reporte.id)}
            >
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Icon 
                      as={reporte.icon} 
                      boxSize={10} 
                      color={`${reporte.color}.500`} 
                    />
                    <Badge colorScheme={reporte.color} fontSize="sm">
                      Estadística
                    </Badge>
                  </HStack>

                  <Box>
                    <Heading size="md" mb={2}>
                      {reporte.titulo}
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      {reporte.descripcion}
                    </Text>
                  </Box>

                  <HStack justify="flex-end" pt={2}>
                    <Text 
                      fontSize="sm" 
                      color={`${reporte.color}.500`}
                      fontWeight="medium"
                    >
                      Ver reporte →
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Información adicional */}
        <Card bg="blue.50">
          <CardBody>
            <HStack spacing={3}>
              <Icon as={FaChartBar} color="blue.500" boxSize={6} />
              <Box>
                <Text fontWeight="medium" color="blue.800">
                  💡 Consejo
                </Text>
                <Text fontSize="sm" color="blue.700" mt={1}>
                  Puedes exportar cualquier reporte a Excel o PDF para compartir con tu equipo.
                  Los reportes se generan en tiempo real con los datos más actualizados.
                </Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default GestionReportes;
