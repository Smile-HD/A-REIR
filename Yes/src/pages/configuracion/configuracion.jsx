import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Switch, 
  FormControlLabel,
  Divider,
  Grid,
  Container,
  useMediaQuery,
} from '@mui/material'
import { Save, Settings } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

function Configuracion() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4 }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom sx={{ mb: 3 }}>
        Configuración del Sistema
      </Typography>

      <Grid container spacing={3}>
        {/* Configuración General */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings />
                Configuración General
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TextField
                fullWidth
                label="Nombre del Taller"
                defaultValue="Multiservicio Renacer"
                margin="normal"
                size={isMobile ? 'small' : 'medium'}
              />
              
              <TextField
                fullWidth
                label="Dirección"
                defaultValue="Av. Principal #123, Santa Cruz"
                margin="normal"
                size={isMobile ? 'small' : 'medium'}
              />
              
              <TextField
                fullWidth
                label="Teléfono"
                defaultValue="+591 3 1234567"
                margin="normal"
                size={isMobile ? 'small' : 'medium'}
              />
              
              <TextField
                fullWidth
                label="Email"
                defaultValue="info@renacer.com"
                margin="normal"
                size={isMobile ? 'small' : 'medium'}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Configuración de Facturación */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuración de Facturación
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TextField
                fullWidth
                label="NIT"
                defaultValue="123456789"
                margin="normal"
                size={isMobile ? 'small' : 'medium'}
              />
              
              <TextField
                fullWidth
                label="Prefijo de Factura"
                defaultValue="FAC-"
                margin="normal"
                size={isMobile ? 'small' : 'medium'}
              />
              
              <TextField
                fullWidth
                label="Número Inicial"
                defaultValue="1"
                type="number"
                margin="normal"
                size={isMobile ? 'small' : 'medium'}
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Generar factura automáticamente"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Configuración de Inventario */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuración de Inventario
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TextField
                fullWidth
                label="Stock Mínimo por Defecto"
                defaultValue="10"
                type="number"
                margin="normal"
                size={isMobile ? 'small' : 'medium'}
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Alertas de stock bajo"
              />
              
              <FormControlLabel
                control={<Switch />}
                label="Control automático de inventario"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Configuración de Notificaciones */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notificaciones
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Notificaciones por email"
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Recordatorios de servicios"
              />
              
              <FormControlLabel
                control={<Switch />}
                label="Notificaciones de stock bajo"
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Alertas de facturas vencidas"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Botón de Guardar */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              size={isMobile ? 'large' : 'medium'}
              startIcon={<Save />}
              fullWidth={isMobile}
              sx={{ 
                backgroundColor: '#ff8c42',
                px: isMobile ? 2 : 4,
                py: isMobile ? 1.5 : 1,
                fontSize: isMobile ? '1rem' : '1.1rem',
                maxWidth: isMobile ? '100%' : '300px'
              }}
            >
              Guardar Configuración
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Configuracion
