import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Checkbox,
  Text,
  Box,
  Divider,
  Heading,
  SimpleGrid,
  Badge,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'

function PermisosRolModal({ isOpen, onClose, rol, permisos, onSave }) {
  const [selectedPermisos, setSelectedPermisos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (rol && rol.permisos) {
      const permisosIds = rol.permisos.map(rp => rp.permiso.id)
      setSelectedPermisos(permisosIds)
    } else {
      setSelectedPermisos([])
    }
  }, [rol, isOpen])

  // Agrupar permisos por módulo
  const permisosPorModulo = permisos.reduce((acc, permiso) => {
    const partes = permiso.nombre.split(':')
    if (partes.length === 2) {
      const [modulo, accion] = partes
      if (!acc[modulo]) {
        acc[modulo] = []
      }
      acc[modulo].push({ ...permiso, accion })
    } else {
      // Permisos antiguos sin formato módulo:accion
      if (!acc['otros']) {
        acc['otros'] = []
      }
      acc['otros'].push({ ...permiso, accion: permiso.nombre })
    }
    return acc
  }, {})

  const modulos = Object.keys(permisosPorModulo).sort()

  // Nombres amigables para módulos
  const nombresModulos = {
    'usuarios': 'Usuarios',
    'roles': 'Roles',
    'permisos': 'Permisos',
    'empleados': 'Empleados',
    'motos': 'Motos',
    'diagnosticos': 'Diagnósticos',
    'clientes': 'Clientes',
    'servicios': 'Servicios',
    'categorias': 'Categorías',
    'proformas': 'Proformas',
    'horarios': 'Horarios',
    'ordenes_trabajo': 'Órdenes de Trabajo',
    'comisiones': 'Comisiones',
    'marcas_herramienta': 'Marcas de Herramientas',
    'herramientas': 'Herramientas',
    'movimientos_herramienta': 'Movimientos de Herramientas',
    'bitacora': 'Bitácora',
    'otros': 'Otros Permisos'
  }

  const nombresAcciones = {
    'crear': 'Crear',
    'ver': 'Ver',
    'editar': 'Editar',
    'eliminar': 'Eliminar'
  }

  const coloresAcciones = {
    'crear': 'green',
    'ver': 'blue',
    'editar': 'orange',
    'eliminar': 'red'
  }

  const handleTogglePermiso = (permisoId) => {
    setSelectedPermisos(prev => {
      if (prev.includes(permisoId)) {
        return prev.filter(id => id !== permisoId)
      } else {
        return [...prev, permisoId]
      }
    })
  }

  const handleToggleModulo = (modulo) => {
    const permisosDelModulo = permisosPorModulo[modulo].map(p => p.id)
    const todosSeleccionados = permisosDelModulo.every(id => selectedPermisos.includes(id))
    
    if (todosSeleccionados) {
      // Deseleccionar todos
      setSelectedPermisos(prev => prev.filter(id => !permisosDelModulo.includes(id)))
    } else {
      // Seleccionar todos
      setSelectedPermisos(prev => [...new Set([...prev, ...permisosDelModulo])])
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    await onSave(selectedPermisos)
    setLoading(false)
  }

  const getModuloStats = (modulo) => {
    const permisosDelModulo = permisosPorModulo[modulo]
    const seleccionados = permisosDelModulo.filter(p => selectedPermisos.includes(p.id)).length
    const total = permisosDelModulo.length
    return { seleccionados, total }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          <VStack align="start" spacing={2}>
            <Text>Gestionar Permisos: {rol?.nombre}</Text>
            <Badge colorScheme="purple" fontSize="sm">
              {selectedPermisos.length} permisos seleccionados
            </Badge>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4} color="gray.600">
            Selecciona los permisos que tendrá este rol. Los permisos están organizados por módulos.
          </Text>
          <Divider mb={4} />
          
          {permisos.length === 0 ? (
            <Text color="gray.500">No hay permisos disponibles</Text>
          ) : (
            <Accordion allowMultiple defaultIndex={modulos.map((_, i) => i)}>
              {modulos.map((modulo) => {
                const stats = getModuloStats(modulo)
                const todosSeleccionados = stats.seleccionados === stats.total
                
                return (
                  <AccordionItem key={modulo} border="1px" borderColor="gray.200" borderRadius="md" mb={3}>
                    <h2>
                      <AccordionButton _expanded={{ bg: 'purple.50' }}>
                        <Box flex="1" textAlign="left">
                          <HStack spacing={3}>
                            <Checkbox
                              isChecked={todosSeleccionados}
                              isIndeterminate={stats.seleccionados > 0 && !todosSeleccionados}
                              onChange={() => handleToggleModulo(modulo)}
                              colorScheme="purple"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Heading size="sm">{nombresModulos[modulo] || modulo}</Heading>
                            <Badge colorScheme={stats.seleccionados === stats.total ? 'purple' : 'gray'}>
                              {stats.seleccionados}/{stats.total}
                            </Badge>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4} bg="gray.50">
                      <SimpleGrid columns={[1, 2, 4]} spacing={3}>
                        {permisosPorModulo[modulo].map((permiso) => (
                          <Box
                            key={permiso.id}
                            p={3}
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor={selectedPermisos.includes(permiso.id) ? 'purple.300' : 'gray.200'}
                            bg={selectedPermisos.includes(permiso.id) ? 'purple.50' : 'white'}
                            _hover={{ 
                              bg: selectedPermisos.includes(permiso.id) ? 'purple.100' : 'gray.100',
                              borderColor: 'purple.300'
                            }}
                            cursor="pointer"
                            onClick={() => handleTogglePermiso(permiso.id)}
                            transition="all 0.2s"
                          >
                            <VStack align="stretch" spacing={2}>
                              <Checkbox
                                isChecked={selectedPermisos.includes(permiso.id)}
                                onChange={() => handleTogglePermiso(permiso.id)}
                                colorScheme="purple"
                              >
                                <Badge 
                                  colorScheme={coloresAcciones[permiso.accion] || 'gray'}
                                  fontSize="xs"
                                >
                                  {nombresAcciones[permiso.accion] || permiso.accion}
                                </Badge>
                              </Checkbox>
                              <Text fontSize="xs" color="gray.600">
                                {permiso.nombre}
                              </Text>
                            </VStack>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </AccordionPanel>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            colorScheme="purple" 
            onClick={handleSubmit}
            isLoading={loading}
          >
            Guardar Permisos ({selectedPermisos.length})
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default PermisosRolModal
