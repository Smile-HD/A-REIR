import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { API_URL } from '../config'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
  const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userEmail', email)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.usuario))
        
        toast({
          title: 'Inicio de sesión exitoso',
          description: 'Bienvenido de nuevo',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        navigate('/dashboard')
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Credenciales inválidas',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo conectar con el servidor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
    
    setIsLoading(false)
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="md">
        <Box bg="white" p={8} borderRadius="lg" boxShadow="xl">
          <VStack spacing={6}>
            <Heading as="h1" size="xl" color="teal.500">
              Iniciar Sesión
            </Heading>
            <Text color="gray.600">
              Ingresa tus credenciales para acceder
            </Text>

            <form onSubmit={handleLogin} style={{ width: '100%' }}>
              <VStack spacing={4} width="100%">
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Contraseña</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="teal"
                  size="lg"
                  width="100%"
                  isLoading={isLoading}
                  loadingText="Iniciando sesión..."
                >
                  Iniciar Sesión
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>
      </Container>
    </Box>
  )
}

export default Login
