import { Box, VStack, HStack, Text, Icon, Flex, Avatar, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react'
import { 
  ViewIcon,
  AtSignIcon,
  LockIcon,
  SettingsIcon,
  StarIcon,
  InfoIcon,
  CheckCircleIcon
} from '@chakra-ui/icons'
import { FaUserTie, FaMotorcycle, FaClipboardList, FaUsers, FaTools, FaFileInvoiceDollar, FaClock, FaClipboardCheck, FaMoneyBillWave, FaTag, FaWrench, FaExchangeAlt, FaHistory, FaStar } from 'react-icons/fa'
import { usePermissions } from '../contexts/PermissionContext'

function Sidebar({ userEmail, onMenuClick, activeMenu = 'dashboard', isOpen, onClose }) {
  const { canAccessModule, user } = usePermissions();

  const menuGroups = {
    general: {
      label: 'General',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: ViewIcon, alwaysShow: true }
      ]
    },
    administracion: {
      label: 'Administración',
      items: [
        { id: 'empleados', label: 'Empleados', icon: FaUserTie, module: 'empleados' },
        { id: 'clientes', label: 'Clientes', icon: FaUsers, module: 'clientes' },
        { id: 'usuarios', label: 'Usuarios', icon: AtSignIcon, module: 'usuarios' },
        { id: 'roles', label: 'Roles', icon: StarIcon, module: 'roles' },
        { id: 'permisos', label: 'Permisos', icon: LockIcon, module: 'permisos' },
        { id: 'bitacora', label: 'Bitácora', icon: FaHistory, module: 'bitacora' }
      ]
    },
    pedidos: {
      label: 'Pedidos',
      items: [
        { id: 'motos', label: 'Motos', icon: FaMotorcycle, module: 'motos' },
        { id: 'diagnosticos', label: 'Diagnósticos', icon: FaClipboardList, module: 'diagnosticos' },
        { id: 'servicios', label: 'Servicios', icon: FaTools, module: 'servicios' },
        { id: 'proformas', label: 'Proformas', icon: FaFileInvoiceDollar, module: 'proformas' }
      ]
    },
    produccion: {
      label: 'Producción',
      items: [
        { id: 'horarios', label: 'Horarios', icon: FaClock, module: 'horarios' },
        { id: 'ordenes-trabajo', label: 'Órdenes de Trabajo', icon: FaClipboardCheck, module: 'ordenes_trabajo' },
        { id: 'comisiones', label: 'Comisiones', icon: FaMoneyBillWave, module: 'comisiones' },
        { id: 'cuentas-por-pagar', label: 'Cuentas por Pagar', icon: FaMoneyBillWave, module: 'comisiones' },
        { id: 'marcas-herramienta', label: 'Marcas de Herramientas', icon: FaTag, module: 'marcas_herramienta' },
        { id: 'herramientas', label: 'Herramientas', icon: FaWrench, module: 'herramientas' },
        { id: 'movimientos-herramienta', label: 'Movimientos', icon: FaExchangeAlt, module: 'movimientos_herramienta' }
      ]
    },
    utiles: {
      label: 'Útiles',
      items: [
        { id: 'reportes', label: 'Reportes', icon: InfoIcon, alwaysShow: true },
        { id: 'valoraciones', label: 'Valoraciones', icon: FaStar, alwaysShow: true },
        { id: 'documentos', label: 'Documentos', icon: CheckCircleIcon, alwaysShow: true },
        { id: 'configuracion', label: 'Configuración', icon: SettingsIcon, alwaysShow: true }
      ]
    }
  };

  const filterMenuItems = (items) => {
    return items.filter(item => {
      if (item.alwaysShow) return true;
      if (item.module) return canAccessModule(item.module);
      return true;
    });
  };

  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      zIndex={20}
      h="100vh"
      pb="10"
      overflowX="hidden"
      overflowY="auto"
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      w={{ base: "full", md: "260px" }}
      display={{ base: isOpen ? "block" : "none", md: "block" }}
    >
      <VStack spacing={0} align="stretch" height="100vh">
        <Box p={4} borderBottom="1px" borderColor="gray.200">
          <Flex align="center">
            <Avatar size="sm" name={userEmail} bg="teal.500" />
            <Box flex={1} ml={3}>
              <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
                {userEmail.split('@')[0]}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {user?.rol || 'Cargando...'}
              </Text>
            </Box>
          </Flex>
        </Box>
        
        <Box flex="1" overflowY="auto" py={4}>
          <Accordion allowMultiple defaultIndex={[0]}>
            {Object.entries(menuGroups).map(([key, group]) => {
              const visibleItems = filterMenuItems(group.items);
              if (visibleItems.length === 0) return null;

            return (
              <AccordionItem key={key}>
                <AccordionButton py={3} _hover={{ bg: 'gray.100' }}>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="medium" color="gray.700">{group.label}</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={1} align="stretch">
                    {visibleItems.map((item) => (
                      <Flex
                        key={item.id}
                        align="center"
                        px="4"
                        py="3"
                        cursor="pointer"
                        role="group"
                        fontSize="sm"
                        borderRadius="md"
                        bg={activeMenu === item.id ? 'teal.50' : 'transparent'}
                        color={activeMenu === item.id ? 'teal.600' : 'gray.700'}
                        _hover={{
                          bg: activeMenu === item.id ? 'teal.50' : 'gray.50',
                        }}
                        onClick={() => {
                          onMenuClick(item.id);
                          onClose();
                        }}
                      >
                        <Icon
                          as={item.icon}
                          boxSize="4"
                          color={activeMenu === item.id ? 'teal.500' : 'gray.500'}
                          _groupHover={{
                            color: 'teal.500',
                          }}
                        />
                        <Text
                          ml="3"
                          fontWeight={activeMenu === item.id ? 'semibold' : 'medium'}
                          _groupHover={{
                            color: 'teal.500',
                          }}
                        >
                          {item.label}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
          </Accordion>
        </Box>

        <Box p={4} borderTop="1px" borderColor="gray.200" bg="white">
          <Text fontSize="xs" color="gray.500" textAlign="center">
            © 2025 Proyecto SI1
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}

export default Sidebar
