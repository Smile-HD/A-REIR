import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material'
import { Add, Edit, Delete, Build, CheckCircle, Schedule } from '@mui/icons-material'

function Servicios() {
  // Datos de ejemplo
  const servicios = [
    { id: 1, cliente: 'Juan Pérez', moto: 'Honda CBR 600', servicio: 'Cambio de aceite', fecha: '2024-01-15', estado: 'Completado', precio: '$50' },
    { id: 2, cliente: 'María García', moto: 'Yamaha YZF R1', servicio: 'Revisión general', fecha: '2024-01-16', estado: 'En Proceso', precio: '$120' },
    { id: 3, cliente: 'Carlos López', moto: 'Kawasaki Ninja 300', servicio: 'Reparación motor', fecha: '2024-01-17', estado: 'Pendiente', precio: '$300' },
    { id: 4, cliente: 'Ana Martínez', moto: 'Suzuki GSX-R 750', servicio: 'Cambio de frenos', fecha: '2024-01-18', estado: 'Completado', precio: '$80' },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Servicios y Reparaciones
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          sx={{ backgroundColor: '#ff8c42' }}
        >
          Nuevo Servicio
        </Button>
      </Box>

      {/* Resumen rápido */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#e8f5e8' }}>
            <CardContent>
              <CheckCircle sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h6">Completados</Typography>
              <Typography variant="h4" color="primary">45</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#fff3e0' }}>
            <CardContent>
              <Build sx={{ fontSize: 40, color: '#ff8c42', mb: 1 }} />
              <Typography variant="h6">En Proceso</Typography>
              <Typography variant="h4" color="primary">12</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#e3f2fd' }}>
            <CardContent>
              <Schedule sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
              <Typography variant="h6">Pendientes</Typography>
              <Typography variant="h4" color="primary">8</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#f3e5f5' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#9c27b0' }}>Ingresos Hoy</Typography>
              <Typography variant="h4" color="primary">$1,250</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Moto</TableCell>
                <TableCell>Servicio</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servicios.map((servicio) => (
                <TableRow key={servicio.id} hover>
                  <TableCell>{servicio.id}</TableCell>
                  <TableCell>{servicio.cliente}</TableCell>
                  <TableCell>{servicio.moto}</TableCell>
                  <TableCell>{servicio.servicio}</TableCell>
                  <TableCell>{servicio.fecha}</TableCell>
                  <TableCell>
                    <Chip 
                      label={servicio.estado} 
                      color={
                        servicio.estado === 'Completado' ? 'success' : 
                        servicio.estado === 'En Proceso' ? 'warning' : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{servicio.precio}</TableCell>
                  <TableCell>
                    <IconButton color="primary" size="small">
                      <Edit />
                    </IconButton>
                    <IconButton color="error" size="small">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default Servicios
