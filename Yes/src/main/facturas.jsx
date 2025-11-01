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
import { Add, Edit, Delete, Receipt, Print, Download } from '@mui/icons-material'

function Facturas() {
  // Datos de ejemplo
  const facturas = [
    { id: 1, numero: 'FAC-001', cliente: 'Juan Pérez', fecha: '2024-01-15', total: '$150', estado: 'Pagada' },
    { id: 2, numero: 'FAC-002', cliente: 'María García', fecha: '2024-01-16', total: '$320', estado: 'Pendiente' },
    { id: 3, numero: 'FAC-003', cliente: 'Carlos López', fecha: '2024-01-17', total: '$85', estado: 'Pagada' },
    { id: 4, numero: 'FAC-004', cliente: 'Ana Martínez', fecha: '2024-01-18', total: '$200', estado: 'Vencida' },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Gestión de Facturas
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          sx={{ backgroundColor: '#ff8c42' }}
        >
          Nueva Factura
        </Button>
      </Box>

      {/* Resumen rápido */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#e8f5e8' }}>
            <CardContent>
              <Receipt sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h6">Pagadas</Typography>
              <Typography variant="h4" color="primary">32</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#fff3e0' }}>
            <CardContent>
              <Receipt sx={{ fontSize: 40, color: '#ff8c42', mb: 1 }} />
              <Typography variant="h6">Pendientes</Typography>
              <Typography variant="h4" color="primary">8</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#ffebee' }}>
            <CardContent>
              <Receipt sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
              <Typography variant="h6">Vencidas</Typography>
              <Typography variant="h4" color="primary">3</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#f3e5f5' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#9c27b0' }}>Total Mes</Typography>
              <Typography variant="h4" color="primary">$12,450</Typography>
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
                <TableCell>Número</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {facturas.map((factura) => (
                <TableRow key={factura.id} hover>
                  <TableCell>{factura.id}</TableCell>
                  <TableCell>{factura.numero}</TableCell>
                  <TableCell>{factura.cliente}</TableCell>
                  <TableCell>{factura.fecha}</TableCell>
                  <TableCell>{factura.total}</TableCell>
                  <TableCell>
                    <Chip 
                      label={factura.estado} 
                      color={
                        factura.estado === 'Pagada' ? 'success' : 
                        factura.estado === 'Pendiente' ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" size="small" title="Imprimir">
                      <Print />
                    </IconButton>
                    <IconButton color="secondary" size="small" title="Descargar">
                      <Download />
                    </IconButton>
                    <IconButton color="primary" size="small" title="Editar">
                      <Edit />
                    </IconButton>
                    <IconButton color="error" size="small" title="Eliminar">
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

export default Facturas
