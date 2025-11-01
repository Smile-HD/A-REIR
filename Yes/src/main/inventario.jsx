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
import { Add, Edit, Delete, Inventory, Warning, CheckCircle } from '@mui/icons-material'

function Inventario() {
  // Datos de ejemplo
  const repuestos = [
    { id: 1, nombre: 'Filtro de aceite', categoria: 'Motor', stock: 25, stockMin: 10, precio: '$15', estado: 'Disponible' },
    { id: 2, nombre: 'Pastillas de freno', categoria: 'Frenos', stock: 5, stockMin: 8, precio: '$35', estado: 'Bajo Stock' },
    { id: 3, nombre: 'Cadena de transmisión', categoria: 'Transmisión', stock: 12, stockMin: 5, precio: '$80', estado: 'Disponible' },
    { id: 4, nombre: 'Bujía de encendido', categoria: 'Motor', stock: 0, stockMin: 15, precio: '$8', estado: 'Agotado' },
    { id: 5, nombre: 'Aceite 10W-40', categoria: 'Lubricantes', stock: 30, stockMin: 20, precio: '$25', estado: 'Disponible' },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Control de Inventario
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          sx={{ backgroundColor: '#ff8c42' }}
        >
          Nuevo Repuesto
        </Button>
      </Box>

      {/* Resumen rápido */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#e8f5e8' }}>
            <CardContent>
              <CheckCircle sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h6">Disponibles</Typography>
              <Typography variant="h4" color="primary">342</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#fff3e0' }}>
            <CardContent>
              <Warning sx={{ fontSize: 40, color: '#ff8c42', mb: 1 }} />
              <Typography variant="h6">Bajo Stock</Typography>
              <Typography variant="h4" color="primary">12</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#ffebee' }}>
            <CardContent>
              <Inventory sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
              <Typography variant="h6">Agotados</Typography>
              <Typography variant="h4" color="primary">5</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#f3e5f5' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#9c27b0' }}>Valor Total</Typography>
              <Typography variant="h4" color="primary">$15,420</Typography>
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
                <TableCell>Nombre</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Stock Mín.</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {repuestos.map((repuesto) => (
                <TableRow key={repuesto.id} hover>
                  <TableCell>{repuesto.id}</TableCell>
                  <TableCell>{repuesto.nombre}</TableCell>
                  <TableCell>{repuesto.categoria}</TableCell>
                  <TableCell>{repuesto.stock}</TableCell>
                  <TableCell>{repuesto.stockMin}</TableCell>
                  <TableCell>{repuesto.precio}</TableCell>
                  <TableCell>
                    <Chip 
                      label={repuesto.estado} 
                      color={
                        repuesto.estado === 'Disponible' ? 'success' : 
                        repuesto.estado === 'Bajo Stock' ? 'warning' : 'error'
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

export default Inventario
