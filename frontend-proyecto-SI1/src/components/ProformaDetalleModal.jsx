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
  HStack,
  Text,
  Divider,
  Box,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Grid,
  GridItem,
} from '@chakra-ui/react'

function ProformaDetalleModal({ isOpen, onClose, proforma }) {
  if (!proforma) return null

  const getEstadoBadge = (estado) => {
    const colores = {
      PENDIENTE: 'yellow',
      APROBADA: 'green',
      RECHAZADA: 'red',
      COMPLETADA: 'blue'
    }
    return <Badge colorScheme={colores[estado] || 'gray'} fontSize="md">{estado}</Badge>
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack justifyContent="space-between">
            <Text>Proforma #{proforma.id}</Text>
            {getEstadoBadge(proforma.estado)}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Información General */}
            <Box>
              <Heading size="md" mb={3}>Información General</Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text fontWeight="bold">Fecha:</Text>
                  <Text>{new Date(proforma.fecha).toLocaleDateString()}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Total:</Text>
                  <Text fontSize="xl" color="green.600" fontWeight="bold">
                    Bs. {parseFloat(proforma.total).toFixed(2)}
                  </Text>
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            {/* Información del Cliente */}
            <Box>
              <Heading size="md" mb={3}>Cliente</Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text fontWeight="bold">CI:</Text>
                  <Text>{proforma.cliente?.ci}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Nombre:</Text>
                  <Text>{`${proforma.cliente?.nombre} ${proforma.cliente?.apellidos}`}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Teléfono:</Text>
                  <Text>{proforma.cliente?.telefono}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Dirección:</Text>
                  <Text>{proforma.cliente?.direccion}</Text>
                </GridItem>
              </Grid>
            </Box>

            {/* Información del Diagnóstico */}
            {proforma.diagnostico && (
              <>
                <Divider />
                <Box>
                  <Heading size="md" mb={3}>Diagnóstico Asociado</Heading>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <Text fontWeight="bold">Número:</Text>
                      <Text>#{proforma.diagnostico.nro}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold">Fecha:</Text>
                      <Text>{new Date(proforma.diagnostico.fecha).toLocaleDateString()}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold">Moto:</Text>
                      <Text>{proforma.diagnostico.moto?.placa} - {proforma.diagnostico.moto?.modelo}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold">Marca:</Text>
                      <Text>{proforma.diagnostico.moto?.marca?.nombre}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold">Empleado:</Text>
                      <Text>{`${proforma.diagnostico.empleado?.nombre} ${proforma.diagnostico.empleado?.apellidos}`}</Text>
                    </GridItem>
                  </Grid>

                  {proforma.diagnostico.detalles && proforma.diagnostico.detalles.length > 0 && (
                    <Box mt={4}>
                      <Text fontWeight="bold" mb={2}>Detalles del Diagnóstico:</Text>
                      <Box bg="gray.50" p={3} borderRadius="md">
                        {proforma.diagnostico.detalles.map((detalle, index) => (
                          <Text key={index} mb={1}>• {detalle.descripcion}</Text>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </>
            )}

            {/* Detalles de Servicios */}
            <Divider />
            <Box>
              <Heading size="md" mb={3}>Detalles de Servicios</Heading>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Descripción</Th>
                      <Th>Servicio</Th>
                      <Th isNumeric>Cantidad</Th>
                      <Th isNumeric>Precio Unit.</Th>
                      <Th isNumeric>Subtotal</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {proforma.detalles && proforma.detalles.map((detalle) => (
                      <Tr key={detalle.id}>
                        <Td>{detalle.descripcion}</Td>
                        <Td>
                          {detalle.servicio ? (
                            <Badge colorScheme="purple">
                              {detalle.servicio.descripcion}
                              <br />
                              <Text fontSize="xs">({detalle.servicio.categoria?.nombre})</Text>
                            </Badge>
                          ) : (
                            <Text fontSize="sm" color="gray.500">Personalizado</Text>
                          )}
                        </Td>
                        <Td isNumeric>{parseFloat(detalle.cantidad).toFixed(2)}</Td>
                        <Td isNumeric>Bs. {parseFloat(detalle.precioUnit).toFixed(2)}</Td>
                        <Td isNumeric fontWeight="bold">Bs. {parseFloat(detalle.subtotal).toFixed(2)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>

            {/* Repuestos */}
            {proforma.repuestos && proforma.repuestos.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Heading size="md" mb={3}>Repuestos Necesarios</Heading>
                  <Box bg="orange.50" p={4} borderRadius="md">
                    <VStack align="stretch" spacing={2}>
                      {proforma.repuestos.map((repuesto) => (
                        <HStack key={repuesto.id}>
                          <Badge colorScheme="orange">{repuesto.id}</Badge>
                          <Text>{repuesto.nombre}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                </Box>
              </>
            )}

            {/* Total Final */}
            <Divider />
            <Box bg="green.50" p={4} borderRadius="md">
              <HStack justifyContent="space-between">
                <Heading size="lg">TOTAL:</Heading>
                <Heading size="lg" color="green.600">
                  Bs. {parseFloat(proforma.total).toFixed(2)}
                </Heading>
              </HStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ProformaDetalleModal
