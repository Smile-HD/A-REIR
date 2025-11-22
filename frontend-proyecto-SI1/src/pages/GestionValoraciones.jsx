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
  IconButton,
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
  Progress,
  Spinner,
  Center,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useClipboard,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
  Link,
} from '@chakra-ui/react';
import { FaStar, FaTrash, FaChartBar, FaShare, FaCopy, FaWhatsapp, FaEnvelope, FaQrcode } from 'react-icons/fa';
import { API_URL } from '../config';
import ConfirmDialog from '../components/ConfirmDialog';

function GestionValoraciones() {
  const [valoraciones, setValoraciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [valoracionToDelete, setValoracionToDelete] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const toast = useToast();

  // Link de valoraciones
  const valoracionURL = `${window.location.origin}/valoracion`;
  const { hasCopied, onCopy } = useClipboard(valoracionURL);

  useEffect(() => {
    fetchValoraciones();
    fetchEstadisticas();
  }, []);

  const fetchValoraciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/valoraciones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener valoraciones');
      }

      const data = await response.json();
      setValoraciones(Array.isArray(data.valoraciones) ? data.valoraciones : []);
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

  const fetchEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/valoraciones/estadisticas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }

      const data = await response.json();
      setEstadisticas(data);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    }
  };

  const handleDelete = async () => {
    if (!valoracionToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/valoraciones/${valoracionToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar valoración');
      }

      toast({
        title: 'Valoración eliminada',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchValoraciones();
      fetchEstadisticas();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setValoracionToDelete(null);
    }
  };

  const renderStars = (calificacion) => {
    return (
      <HStack spacing={1}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            as={FaStar}
            color={star <= calificacion ? 'yellow.400' : 'gray.300'}
            boxSize={4}
          />
        ))}
      </HStack>
    );
  };

  const getCalificacionColor = (calificacion) => {
    if (calificacion >= 4) return 'green';
    if (calificacion >= 3) return 'yellow';
    return 'red';
  };

  const handleCopyLink = () => {
    onCopy();
    toast({
      title: '¡Link copiado!',
      description: 'El enlace ha sido copiado al portapapeles',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `¡Queremos conocer tu opinión! 🌟\n\nAyúdanos a mejorar calificando tu experiencia en nuestro taller:\n${valoracionURL}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent('Valoración de Servicio - Taller Mecánico');
    const body = encodeURIComponent(
      `Estimado cliente,\n\nNos gustaría conocer su opinión sobre el servicio recibido.\n\nPor favor, tómese un momento para valorarnos en:\n${valoracionURL}\n\n¡Muchas gracias por su tiempo!\n\nSaludos,\nTaller Mecánico`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShowQR = () => {
    setIsQRModalOpen(true);
  };

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
        <HStack justify="space-between" align="center">
          <Heading size="lg">
            <HStack>
              <Icon as={FaChartBar} />
              <Text>Valoraciones de Clientes</Text>
            </HStack>
          </Heading>

          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<FaShare />}
              colorScheme="teal"
              variant="solid"
            >
              Compartir Link
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FaCopy />} onClick={handleCopyLink}>
                {hasCopied ? '¡Copiado!' : 'Copiar enlace'}
              </MenuItem>
              <MenuItem icon={<FaWhatsapp />} onClick={handleShareWhatsApp}>
                Compartir por WhatsApp
              </MenuItem>
              <MenuItem icon={<FaEnvelope />} onClick={handleShareEmail}>
                Compartir por Email
              </MenuItem>
              <MenuItem icon={<FaQrcode />} onClick={handleShowQR}>
                Mostrar código QR
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>

        {/* Card con el link para compartir */}
        <Card bg="teal.50" borderLeft="4px solid" borderColor="teal.500">
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <HStack>
                <Icon as={FaShare} color="teal.600" />
                <Text fontWeight="bold" color="teal.700">
                  Comparte este enlace con tus clientes
                </Text>
              </HStack>
              <InputGroup size="lg">
                <Input
                  value={valoracionURL}
                  isReadOnly
                  bg="white"
                  pr="4.5rem"
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleCopyLink} colorScheme="teal">
                    {hasCopied ? 'Copiado' : 'Copiar'}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Text fontSize="sm" color="gray.600">
                📱 Los clientes pueden valorar tu servicio escaneando un código QR o visitando este enlace
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {estadisticas && (
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
            <GridItem>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total de Valoraciones</StatLabel>
                    <StatNumber>{estadisticas.totalValoraciones}</StatNumber>
                    <StatHelpText>Desde el inicio</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>

            <GridItem>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Calificación Promedio</StatLabel>
                    <StatNumber>
                      <HStack>
                        <Text>{estadisticas.promedioCalificacion}</Text>
                        <Icon as={FaStar} color="yellow.400" boxSize={6} />
                      </HStack>
                    </StatNumber>
                    <StatHelpText>De 5.00 estrellas</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>

            <GridItem colSpan={{ base: 1, md: 2 }}>
              <Card>
                <CardBody>
                  <Text fontWeight="bold" mb={4}>Distribución de Calificaciones</Text>
                  <VStack spacing={3} align="stretch">
                    {[5, 4, 3, 2, 1].map((num) => (
                      <HStack key={num} spacing={3}>
                        <HStack spacing={1} minW="80px">
                          <Text fontSize="sm">{num}</Text>
                          <Icon as={FaStar} color="yellow.400" boxSize={3} />
                        </HStack>
                        <Progress
                          value={
                            estadisticas.totalValoraciones > 0
                              ? (estadisticas.distribucion[
                                  num === 5 ? 'cinco' :
                                  num === 4 ? 'cuatro' :
                                  num === 3 ? 'tres' :
                                  num === 2 ? 'dos' : 'uno'
                                ] / estadisticas.totalValoraciones) * 100
                              : 0
                          }
                          flex="1"
                          colorScheme={getCalificacionColor(num)}
                          borderRadius="full"
                          height="8px"
                        />
                        <Text fontSize="sm" minW="40px">
                          {estadisticas.distribucion[
                            num === 5 ? 'cinco' :
                            num === 4 ? 'cuatro' :
                            num === 3 ? 'tres' :
                            num === 2 ? 'dos' : 'uno'
                          ]}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        )}

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Todas las Valoraciones</Heading>
            {valoraciones.length === 0 ? (
              <Center py={8}>
                <Text color="gray.500">No hay valoraciones aún</Text>
              </Center>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Fecha</Th>
                      <Th>Cliente</Th>
                      <Th>Correo</Th>
                      <Th>Calificación</Th>
                      <Th>Comentario</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {valoraciones.map((valoracion) => (
                      <Tr key={valoracion.id}>
                        <Td>
                          {new Date(valoracion.fecha).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Td>
                        <Td>{valoracion.nombre || 'Anónimo'}</Td>
                        <Td>
                          {valoracion.correo || (
                            <Text color="gray.400" fontSize="sm">Sin correo</Text>
                          )}
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            {renderStars(valoracion.calificacion)}
                            <Badge colorScheme={getCalificacionColor(valoracion.calificacion)}>
                              {valoracion.calificacion}/5
                            </Badge>
                          </VStack>
                        </Td>
                        <Td maxW="300px">
                          {valoracion.comentario ? (
                            <Text fontSize="sm" noOfLines={3}>
                              {valoracion.comentario}
                            </Text>
                          ) : (
                            <Text color="gray.400" fontSize="sm">Sin comentario</Text>
                          )}
                        </Td>
                        <Td>
                          <IconButton
                            icon={<FaTrash />}
                            colorScheme="red"
                            variant="ghost"
                            size="sm"
                            onClick={() => setValoracionToDelete(valoracion)}
                            aria-label="Eliminar valoración"
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>
      </VStack>

      <ConfirmDialog
        isOpen={!!valoracionToDelete}
        onClose={() => setValoracionToDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar Valoración"
        message={`¿Estás seguro de eliminar la valoración de ${valoracionToDelete?.nombre || 'Anónimo'}?`}
      />

      {/* Modal de código QR */}
      <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Código QR para Valoraciones</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text textAlign="center" color="gray.600">
                Los clientes pueden escanear este código QR con su celular para dejar una valoración
              </Text>
              <Box p={4} bg="white" borderRadius="md" boxShadow="md">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(valoracionURL)}`}
                  alt="QR Code para valoraciones"
                  boxSize="300px"
                />
              </Box>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                {valoracionURL}
              </Text>
              <Text fontSize="xs" color="gray.400" textAlign="center">
                💡 Tip: Puedes imprimir este código QR y colocarlo en tu taller
              </Text>
              <Button
                as={Link}
                href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(valoracionURL)}`}
                download="qr-valoraciones.png"
                colorScheme="teal"
                width="full"
              >
                Descargar QR en alta calidad
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default GestionValoraciones;
