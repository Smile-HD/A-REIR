import { Box, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material'
import { TrendingUp, People, DirectionsBike, Build, Inventory, Receipt } from '@mui/icons-material'

function Dashboard() {
  const stats = [
    { title: 'Clientes Activos', value: '156', icon: <People />, color: '#ff8c42' },
    { title: 'Motos Registradas', value: '89', icon: <DirectionsBike />, color: '#4caf50' },
    { title: 'Servicios Pendientes', value: '23', icon: <Build />, color: '#2196f3' },
    { title: 'Repuestos en Stock', value: '342', icon: <Inventory />, color: '#9c27b0' },
    { title: 'Facturas del Mes', value: '45', icon: <Receipt />, color: '#f44336' },
    { title: 'Ingresos del Mes', value: '$12,450', icon: <TrendingUp />, color: '#4caf50' },
  ]

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Dashboard Principal
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
              border: '1px solid #ddd',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: '50%', 
                    backgroundColor: stat.color,
                    color: 'white',
                    mr: 2
                  }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {stat.value}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" sx={{ color: stat.color }}>
                  Ver detalles
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Dashboard
