import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Icon,
  FormErrorMessage,
  Card,
  CardBody,
  Stack,
} from '@chakra-ui/react';
import { FaStar, FaRegStar, FaCheckCircle } from 'react-icons/fa';
import { API_URL } from '../config';

function ValoracionPublica() {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    calificacion: 0,
    comentario: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const toast = useToast();

  const validate = () => {
    const newErrors = {};
    
    if (!formData.calificacion || formData.calificacion < 1) {
      newErrors.calificacion = 'Por favor, selecciona una calificación';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/valoraciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la valoración');
      }

      setEnviado(true);
      toast({
        title: '¡Gracias por tu valoración!',
        description: 'Tu opinión nos ayuda a mejorar nuestro servicio',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      calificacion: rating
    }));
    if (errors.calificacion) {
      setErrors(prev => ({
        ...prev,
        calificacion: ''
      }));
    }
  };

  if (enviado) {
    return (
      <Box
        minH="100vh"
        bgGradient="linear(to-br, teal.400, blue.500)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Container maxW="container.md">
          <Card>
            <CardBody>
              <VStack spacing={6} py={8}>
                <Icon as={FaCheckCircle} boxSize={20} color="green.500" />
                <Heading size="lg" textAlign="center" color="teal.600">
                  ¡Valoración Enviada!
                </Heading>
                <Text textAlign="center" fontSize="lg" color="gray.600">
                  Gracias por tomarte el tiempo de valorar nuestro servicio.
                  Tu opinión es muy importante para nosotros.
                </Text>
                <Text textAlign="center" fontSize="sm" color="gray.500">
                  Podrás enviar otra valoración mañana.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, teal.400, blue.500)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Container maxW="container.md">
        <Card>
          <CardBody>
            <VStack spacing={6} as="form" onSubmit={handleSubmit}>
              <Heading size="xl" textAlign="center" color="teal.600">
                ¿Cómo fue tu experiencia?
              </Heading>
              <Text textAlign="center" color="gray.600">
                Tu opinión nos ayuda a mejorar nuestro servicio de taller mecánico
              </Text>

              <Stack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Nombre (opcional)</FormLabel>
                  <Input
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Correo electrónico (opcional)</FormLabel>
                  <Input
                    name="correo"
                    type="email"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                    size="lg"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    No compartiremos tu correo con nadie
                  </Text>
                </FormControl>

                <FormControl isInvalid={errors.calificacion} isRequired>
                  <FormLabel textAlign="center" fontSize="lg" fontWeight="bold">
                    ¿Cómo calificarías nuestro servicio?
                  </FormLabel>
                  <HStack spacing={4} justify="center" py={4}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Icon
                        key={rating}
                        as={
                          rating <= (hoverRating || formData.calificacion)
                            ? FaStar
                            : FaRegStar
                        }
                        boxSize={12}
                        color={
                          rating <= (hoverRating || formData.calificacion)
                            ? 'yellow.400'
                            : 'gray.300'
                        }
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ transform: 'scale(1.1)' }}
                        onClick={() => handleRatingClick(rating)}
                        onMouseEnter={() => setHoverRating(rating)}
                        onMouseLeave={() => setHoverRating(0)}
                      />
                    ))}
                  </HStack>
                  {formData.calificacion > 0 && (
                    <Text textAlign="center" color="teal.600" fontWeight="bold">
                      {formData.calificacion === 5 && '¡Excelente! ⭐'}
                      {formData.calificacion === 4 && 'Muy bien 👍'}
                      {formData.calificacion === 3 && 'Aceptable 👌'}
                      {formData.calificacion === 2 && 'Puede mejorar 🤔'}
                      {formData.calificacion === 1 && 'Necesitamos mejorar 😔'}
                    </Text>
                  )}
                  <FormErrorMessage justifyContent="center">
                    {errors.calificacion}
                  </FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Comentarios adicionales (opcional)</FormLabel>
                  <Textarea
                    name="comentario"
                    value={formData.comentario}
                    onChange={handleChange}
                    placeholder="Cuéntanos más sobre tu experiencia..."
                    rows={4}
                    size="lg"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="teal"
                  size="lg"
                  width="100%"
                  isLoading={loading}
                  loadingText="Enviando..."
                  mt={4}
                >
                  Enviar Valoración
                </Button>

                <Text fontSize="xs" textAlign="center" color="gray.500">
                  Solo se permite una valoración por día
                </Text>
              </Stack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}

export default ValoracionPublica;
