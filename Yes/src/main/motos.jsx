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
import { Add, Edit, Delete, DirectionsBike } from '@mui/icons-material'

function Motos() {
  // Datos de ejemplo
  const motos = [
    { id: 1, marca: 'Honda', modelo: 'CBR 600', año: 2020, placa: 'ABC-123', cliente: 'Juan Pérez', estado: 'En Servicio' },
    { id: 2, marca: 'Yamaha', modelo: 'YZF R1', año: 2019, placa: 'XYZ-789', cliente: 'María García', estado: 'Disponible' },
    { id: 3, marca: 'Kawasaki', modelo: 'Ninja 300', año: 2021, placa: 'DEF-456', cliente: 'Carlos López', estado: 'En Reparación' },
    { id: 4, marca: 'Suzuki', modelo: 'GSX-R 750', año: 2018, placa: 'GHI-012', cliente: 'Ana Martínez', estado: 'Disponible' },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Registro de Motos
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          sx={{ backgroundColor: '#ff8c42' }}
        >
          Nueva Moto
        </Button>
      </Box>

      {/* Resumen rápido */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#e3f2fd' }}>
            <CardContent>
              <DirectionsBike sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
              <Typography variant="h6">Total Motos</Typography>
              <Typography variant="h4" color="primary">89</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#fff3e0' }}>
            <CardContent>
              <DirectionsBike sx={{ fontSize: 40, color: '#ff8c42', mb: 1 }} />
              <Typography variant="h6">En Servicio</Typography>
              <Typography variant="h4" color="primary">23</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#e8f5e8' }}>
            <CardContent>
              <DirectionsBike sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h6">Disponibles</Typography>
              <Typography variant="h4" color="primary">45</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#ffebee' }}>
            <CardContent>
              <DirectionsBike sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
              <Typography variant="h6">En Reparación</Typography>
              <Typography variant="h4" color="primary">21</Typography>
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
                <TableCell>Marca</TableCell>
                <TableCell>Modelo</TableCell>
                <TableCell>Año</TableCell>
                <TableCell>Placa</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {motos.map((moto) => (
                <TableRow key={moto.id} hover>
                  <TableCell>{moto.id}</TableCell>
                  <TableCell>{moto.marca}</TableCell>
                  <TableCell>{moto.modelo}</TableCell>
                  <TableCell>{moto.año}</TableCell>
                  <TableCell>{moto.placa}</TableCell>
                  <TableCell>{moto.cliente}</TableCell>
                  <TableCell>
                    <Chip 
                      label={moto.estado} 
                      color={
                        moto.estado === 'Disponible' ? 'success' : 
                        moto.estado === 'En Servicio' ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
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

export default Motos
