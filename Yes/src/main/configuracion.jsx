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
  Grid
} from '@mui/material'
import { Save, Settings } from '@mui/icons-material'

function Configuracion() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
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
              />
              
              <TextField
                fullWidth
                label="Dirección"
                defaultValue="Av. Principal #123, Santa Cruz"
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Teléfono"
                defaultValue="+591 3 1234567"
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Email"
                defaultValue="info@renacer.com"
                margin="normal"
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
              />
              
              <TextField
                fullWidth
                label="Prefijo de Factura"
                defaultValue="FAC-"
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Número Inicial"
                defaultValue="1"
                type="number"
                margin="normal"
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
              size="large"
              startIcon={<Save />}
              sx={{ 
                backgroundColor: '#ff8c42',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              Guardar Configuración
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Configuracion
