import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Avatar,
  useToast,
  VStack,
  HStack,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react'
import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons'
import Sidebar from '../components/Sidebar'
import GestionUsuarios from './Administracion/GestionUsuarios'
import GestionRoles from './Administracion/GestionRoles'
import GestionPermisos from './Administracion/GestionPermisos'
import GestionEmpleados from './Administracion/GestionEmpleados'
import GestionMotos from './Pedido/GestionMotos'
import GestionDiagnosticos from './Pedido/GestionDiagnosticos'
import GestionClientes from './Administracion/GestionClientes'
import GestionServicios from './Pedido/GestionServicios'
import GestionProformas from './Pedido/GestionProformas'
import GestionHorarios from './Produccion/GestionHorarios'
import GestionOrdenesTrabajo from './Produccion/GestionOrdenesTrabajo'
import GestionComisiones from './Produccion/GestionComisiones'
import CuentasPorPagar from './Produccion/CuentasPorPagar'
import GestionMarcasHerramienta from './Produccion/GestionMarcasHerramienta'
import GestionHerramientas from './Produccion/GestionHerramientas'
import GestionMovimientosHerramienta from './Produccion/GestionMovimientosHerramienta'
import GestionBitacora from './Administracion/GestionBitacora'
import GestionReportes from './Reportes/GestionReportes'
import GestionValoraciones from './GestionValoraciones'

function Dashboard() {
  const navigate = useNavigate()
  const toast = useToast()
  const userEmail = localStorage.getItem('userEmail') || 'Usuario'
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userEmail')
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión exitosamente',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
    navigate('/login')
  }

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId)
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Sidebar */}
      <Sidebar 
        userEmail={userEmail} 
        onMenuClick={handleMenuClick}
        activeMenu={activeMenu}
        isOpen={isOpen}
        onClose={onClose}
      />

      {/* Main Content with responsive left margin */}
      <Box ml={{ base: 0, md: '260px' }}>
        {/* Top Header */}
        <Box bg="white" px={6} py={4} boxShadow="sm" position="sticky" top={0} zIndex={10}>
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              {/* Botón hamburguesa para móvil */}
              <IconButton
                icon={<HamburgerIcon />}
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                variant="ghost"
                aria-label="Abrir menú"
              />
              <Box>
                <Heading size="lg" color="teal.600" textTransform="capitalize">
                  {activeMenu}
                </Heading>
                <Text fontSize="sm" color="gray.600" display={{ base: 'none', sm: 'block' }}>
                  Gestiona tu {activeMenu} desde aquí
                </Text>
              </Box>
            </HStack>
            <HStack spacing={3}>
              <VStack spacing={0} align="flex-end" display={{ base: 'none', md: 'flex' }}>
                <Text fontWeight="bold" fontSize="sm">
                  {userEmail}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Administrador
                </Text>
              </VStack>
              <Avatar size="sm" name={userEmail} bg="teal.500" />
              <IconButton
                icon={<CloseIcon />}
                colorScheme="red"
                variant="outline"
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                size="sm"
              />
            </HStack>
          </Flex>
        </Box>

        {/* Content Area */}
        <Box p={6}>
          {activeMenu === 'dashboard' && (
            <VStack spacing={6} align="stretch">
              {/* Welcome Section */}
              <Box>
                <Heading size="md" mb={2}>
                  Bienvenido, {userEmail.split('@')[0]}
                </Heading>
                <Text color="gray.600">
                  Este es tu panel de control principal
                </Text>
              </Box>

              {/* Stats Grid */}
              <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
                <GridItem>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Usuarios Totales</StatLabel>
                        <StatNumber>1,234</StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          23.36%
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </GridItem>

                <GridItem>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Ventas</StatLabel>
                        <StatNumber>$45,678</StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          12.05%
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </GridItem>

                <GridItem>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Proyectos Activos</StatLabel>
                        <StatNumber>87</StatNumber>
                        <StatHelpText>
                          <StatArrow type="decrease" />
                          5.12%
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </GridItem>

                <GridItem>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Tasa de Conversión</StatLabel>
                        <StatNumber>34%</StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          8.21%
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <Heading size="md">Actividad Reciente</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <Text fontWeight="bold">Nuevo usuario registrado</Text>
                      <Text fontSize="sm" color="gray.600">
                        Hace 5 minutos
                      </Text>
                    </Box>
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <Text fontWeight="bold">Proyecto completado</Text>
                      <Text fontSize="sm" color="gray.600">
                        Hace 1 hora
                      </Text>
                    </Box>
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <Text fontWeight="bold">Nueva venta procesada</Text>
                      <Text fontSize="sm" color="gray.600">
                        Hace 3 horas
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          )}

          {activeMenu === 'empleados' && (
            <GestionEmpleados />
          )}

          {activeMenu === 'motos' && (
            <GestionMotos />
          )}

          {activeMenu === 'diagnosticos' && (
            <GestionDiagnosticos />
          )}

          {activeMenu === 'clientes' && (
            <GestionClientes />
          )}

          {activeMenu === 'servicios' && (
            <GestionServicios />
          )}

          {activeMenu === 'proformas' && (
            <GestionProformas />
          )}

          {activeMenu === 'horarios' && (
            <GestionHorarios />
          )}

          {activeMenu === 'ordenes-trabajo' && (
            <GestionOrdenesTrabajo />
          )}

          {activeMenu === 'comisiones' && (
            <GestionComisiones />
          )}

          {activeMenu === 'cuentas-por-pagar' && (
            <CuentasPorPagar />
          )}

          {activeMenu === 'marcas-herramienta' && (
            <GestionMarcasHerramienta />
          )}

          {activeMenu === 'herramientas' && (
            <GestionHerramientas />
          )}

          {activeMenu === 'movimientos-herramienta' && (
            <GestionMovimientosHerramienta />
          )}

          {activeMenu === 'bitacora' && (
            <GestionBitacora />
          )}

          {activeMenu === 'usuarios' && (
            <GestionUsuarios />
          )}

          {activeMenu === 'roles' && (
            <GestionRoles />
          )}

          {activeMenu === 'permisos' && (
            <GestionPermisos />
          )}

          {activeMenu === 'reportes' && (
            <GestionReportes />
          )}

          {activeMenu === 'valoraciones' && (
            <GestionValoraciones />
          )}

          {activeMenu === 'documentos' && (
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Documentos</Heading>
                <Text color="gray.600">Gestiona los documentos del sistema.</Text>
              </CardBody>
            </Card>
          )}

          {activeMenu === 'configuracion' && (
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Configuración</Heading>
                <Text color="gray.600">Ajusta las configuraciones del sistema.</Text>
              </CardBody>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default Dashboard
