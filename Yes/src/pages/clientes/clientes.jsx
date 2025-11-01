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
  Card,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Container,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from '@mui/material/styles'
import { Add, Edit, Delete, Search, Visibility } from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import { API_BASE } from "../../utils/apiConfig";

function Clientes() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // Estados
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para paginación
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [sortBy] = useState('nombre');
  const [sortOrder] = useState('asc');
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    ci: '',
    nombre: '',
    telefono: '',
    direccion: ''
  });

  // Cargar clientes con paginación
  const fetchClientes = useCallback(async (currentPageParam, currentRowsPerPageParam) => {
    const currentPage = typeof currentPageParam === 'number' ? currentPageParam : page;
    const currentRowsPerPage = typeof currentRowsPerPageParam === 'number' ? currentRowsPerPageParam : rowsPerPage;
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentRowsPerPage.toString(),
        sortBy,
        sortOrder
      });

  const res = await fetch(`${API_BASE}/clientes?${params}`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setClientes(data.clientes || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotalClientes(data.pagination?.totalClientes || 0);
        setIsSearching(false);
      } else {
        throw new Error('Error al obtener clientes');
      }
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      setError('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortBy, sortOrder]);

  // Buscar clientes con paginación
  const searchClientes = async (currentPage = 1) => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      setPage(1);
      fetchClientes(1, rowsPerPage);
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      const params = new URLSearchParams({
        q: searchTerm,
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
        sortBy,
        sortOrder
      });

  const res = await fetch(`${API_BASE}/clientes/search?${params}`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setClientes(data.clientes || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotalClientes(data.pagination?.totalResults || 0);
        setPage(currentPage);
      } else {
        throw new Error('Error en la búsqueda');
      }
    } catch (error) {
      console.error("Error al buscar clientes:", error);
      setError('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  // Crear cliente
  const createCliente = async () => {
    // Validaciones del lado del cliente
    if (!formData.ci || formData.ci.trim().length === 0) {
      setError('La cédula de identidad es obligatoria');
      return;
    }
    if (formData.ci.length > 20) {
      setError('La cédula de identidad no puede exceder 20 caracteres');
      return;
    }
    if (!formData.nombre || formData.nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }
    if (formData.nombre.length > 100) {
      setError('El nombre no puede exceder 100 caracteres');
      return;
    }
    if (!formData.telefono || formData.telefono.trim().length === 0) {
      setError('El teléfono es obligatorio');
      return;
    }
    if (formData.telefono.length > 20) {
      setError('El teléfono no puede exceder 20 caracteres');
      return;
    }
    if (!formData.direccion || formData.direccion.trim().length < 5) {
      setError('La dirección debe tener al menos 5 caracteres');
      return;
    }
    if (formData.direccion.length > 200) {
      setError('La dirección no puede exceder 200 caracteres');
      return;
    }

    try {
  const res = await fetch(`${API_BASE}/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        await res.json();
        setSuccess('Cliente creado exitosamente');
        setShowCreateModal(false);
        resetForm();
        refreshData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al crear cliente');
      }
    } catch (error) {
      console.error("Error al crear cliente:", error);
      setError(error.message);
    }
  };

  // Actualizar cliente
  const updateCliente = async () => {
    // Validaciones del lado del cliente
    if (!formData.nombre || formData.nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }
    if (formData.nombre.length > 100) {
      setError('El nombre no puede exceder 100 caracteres');
      return;
    }
    if (!formData.telefono || formData.telefono.trim().length === 0) {
      setError('El teléfono es obligatorio');
      return;
    }
    if (formData.telefono.length > 20) {
      setError('El teléfono no puede exceder 20 caracteres');
      return;
    }
    if (!formData.direccion || formData.direccion.trim().length < 5) {
      setError('La dirección debe tener al menos 5 caracteres');
      return;
    }
    if (formData.direccion.length > 200) {
      setError('La dirección no puede exceder 200 caracteres');
      return;
    }

    try {
  const res = await fetch(`${API_BASE}/clientes/${selectedCliente.ci}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nombre: formData.nombre,
          telefono: formData.telefono,
          direccion: formData.direccion
        })
      });
      
      if (res.ok) {
        setSuccess('Cliente actualizado exitosamente');
        setShowEditModal(false);
        resetForm();
        refreshData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al actualizar cliente');
      }
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      setError(error.message);
    }
  };

  // Eliminar cliente
  const deleteCliente = async () => {
    try {
  const res = await fetch(`${API_BASE}/clientes/${selectedCliente.ci}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (res.ok) {
        setSuccess('Cliente eliminado exitosamente');
        setShowDeleteModal(false);
        refreshData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar cliente');
      }
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      setError(error.message);
    }
  };

  // Funciones auxiliares
  const resetForm = () => {
    setFormData({
      ci: '',
      nombre: '',
      telefono: '',
      direccion: ''
    });
    setSelectedCliente(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openEditModal = (cliente) => {
    setSelectedCliente(cliente);
    setFormData({
      ci: cliente.ci,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      direccion: cliente.direccion
    });
    setShowEditModal(true);
  };

  const openViewModal = (cliente) => {
    setSelectedCliente(cliente);
    setShowViewModal(true);
  };

  const openDeleteModal = (cliente) => {
    setSelectedCliente(cliente);
    setShowDeleteModal(true);
  };

  // Manejar cambio de página
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    if (isSearching) {
      searchClientes(newPage);
    } else {
      fetchClientes(newPage, rowsPerPage);
    }
  };

  // Manejar cambio de filas por página
  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
    if (isSearching) {
      searchClientes(1);
    } else {
      fetchClientes(1, newRowsPerPage);
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setPage(1);
    fetchClientes(1, rowsPerPage);
  };

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Refrescar datos después de operaciones CRUD
  const refreshData = () => {
    if (isSearching) {
      searchClientes(page);
    } else {
      fetchClientes(page, rowsPerPage);
    }
  };
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header responsive */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? 2 : 0
        }}>
          <Typography variant={isMobile ? 'h5' : 'h4'}>Gestión de Clientes</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            fullWidth={isMobile}
            sx={{ maxWidth: isMobile ? '100%' : '200px', backgroundColor: '#ff8c42' }}
            onClick={() => setShowCreateModal(true)}
          >
            Nuevo Cliente
          </Button>
        </Box>
      </Box>

      {/* Controles de búsqueda y paginación (responsive) */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            placeholder="Buscar cliente por CI, nombre, teléfono o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchClientes()}
            size={isMobile ? 'small' : 'medium'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    size={isMobile ? 'small' : 'medium'}
                    onClick={() => searchClientes(1)}
                    sx={{ backgroundColor: "#ff8c42", mr: 1 }}
                    fullWidth={isMobile}
                  >
                    Buscar
                  </Button>
                  {isSearching && (
                    <Button
                      variant="outlined"
                      size={isMobile ? 'small' : 'medium'}
                      onClick={clearSearch}
                    >
                      Limpiar
                    </Button>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            placeholder="10"
            size={isMobile ? 'small' : 'medium'}
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
            onClick={() => searchClientes(1)}
            sx={{ backgroundColor: "#ff8c42" }}
          >
            Buscar
          </Button>
        </Grid>
      </Grid>

      {/* Información de resultados */}
      <Grid container alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <Typography variant="body2" color="text.secondary">
            {isSearching ? (
              `Mostrando ${clientes.length} de ${totalClientes} resultados para "${searchTerm}"`
            ) : (
              `Mostrando ${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalClientes)} de ${totalClientes} clientes`
            )}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size={isSmUp ? 'medium' : 'small'}
            />
          )}
        </Grid>
      </Grid>

      {/* Contenido principal: Cards en móvil, Tabla en desktop */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            {isMobile ? (
              // VISTA MÓVIL - CARDS
              <Box>
                {clientes.length === 0 ? (
                  <Typography align="center">No se encontraron clientes</Typography>
                ) : (
                  clientes.map((cliente) => (
                    <Card key={cliente.ci} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Typography variant="h6">{cliente.nombre}</Typography>
                          <Typography variant="body2" color="text.secondary">CI: {cliente.ci}</Typography>
                          <Typography variant="body2" color="text.secondary">Tel: {cliente.telefono}</Typography>
                          <Typography variant="body2" color="text.secondary">Dir: {cliente.direccion}</Typography>
                        </Box>
                        <Box>
                          <IconButton size="small" color="info" onClick={() => openViewModal(cliente)} title="Ver detalles"><Visibility /></IconButton>
                          <IconButton size="small" color="primary" onClick={() => openEditModal(cliente)} title="Editar"><Edit /></IconButton>
                          <IconButton size="small" color="error" onClick={() => openDeleteModal(cliente)} title="Eliminar"><Delete /></IconButton>
                        </Box>
                      </Box>
                    </Card>
                  ))
                )}
              </Box>
            ) : (
              // VISTA DESKTOP - TABLA NORMAL (misma estructura)
              <Box sx={{ width: '100%', overflowX: 'visible' }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell>CI</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Teléfono</TableCell>
                        <TableCell>Dirección</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clientes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">No se encontraron clientes</TableCell>
                        </TableRow>
                      ) : (
                        clientes.map((cliente) => (
                          <TableRow key={cliente.ci} hover>
                            <TableCell>{cliente.ci}</TableCell>
                            <TableCell>{cliente.nombre}</TableCell>
                            <TableCell>{cliente.telefono}</TableCell>
                            <TableCell>{cliente.direccion}</TableCell>
                            <TableCell>
                              <IconButton color="info" size="small" onClick={() => openViewModal(cliente)} title="Ver detalles"><Visibility /></IconButton>
                              <IconButton color="primary" size="small" onClick={() => openEditModal(cliente)} title="Editar"><Edit /></IconButton>
                              <IconButton color="error" size="small" onClick={() => openDeleteModal(cliente)} title="Eliminar"><Delete /></IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}

        {/* Paginación inferior */}
        {totalPages > 1 && !loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 1 : 0 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              size={isSmUp ? 'medium' : 'small'}
            />
          </Box>
        )}
      </Paper>

      {/* Modal Crear Cliente */}
      <Dialog 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Nuevo Cliente</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="ci"
              label="Cédula de Identidad"
              type="number"
              value={formData.ci}
              onChange={handleInputChange}
              fullWidth
              required
              inputProps={{ 
                maxLength: 20
              }}
              helperText={`${formData.ci.length}/20 caracteres`}
            />
            <TextField
              name="nombre"
              label="Nombre Completo"
              value={formData.nombre}
              onChange={handleInputChange}
              fullWidth
              required
              inputProps={{ 
                maxLength: 100,
                minLength: 3
              }}
              helperText={`${formData.nombre.length}/100 caracteres (mínimo 3)`}
            />
            <TextField
              name="telefono"
              label="Teléfono"
              value={formData.telefono}
              onChange={handleInputChange}
              fullWidth
              required
              inputProps={{ 
                maxLength: 20
              }}
              helperText={`${formData.telefono.length}/20 caracteres`}
            />
            <TextField
              name="direccion"
              label="Dirección"
              value={formData.direccion}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
              required
              inputProps={{ 
                maxLength: 200,
                minLength: 5
              }}
              helperText={`${formData.direccion.length}/200 caracteres (mínimo 5)`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowCreateModal(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button 
            onClick={createCliente}
            variant="contained"
            sx={{ backgroundColor: "#ff8c42" }}
          >
            Crear Cliente
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar Cliente */}
      <Dialog 
        open={showEditModal} 
        onClose={() => setShowEditModal(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Editar Cliente</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="ci"
              label="Cédula de Identidad"
              value={formData.ci}
              fullWidth
              disabled
            />
            <TextField
              name="nombre"
              label="Nombre Completo"
              value={formData.nombre}
              onChange={handleInputChange}
              fullWidth
              required
              inputProps={{ 
                maxLength: 100,
                minLength: 3
              }}
              helperText={`${formData.nombre.length}/100 caracteres (mínimo 3)`}
            />
            <TextField
              name="telefono"
              label="Teléfono"
              value={formData.telefono}
              onChange={handleInputChange}
              fullWidth
              required
              inputProps={{ 
                maxLength: 20
              }}
              helperText={`${formData.telefono.length}/20 caracteres`}
            />
            <TextField
              name="direccion"
              label="Dirección"
              value={formData.direccion}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
              required
              inputProps={{ 
                maxLength: 200,
                minLength: 5
              }}
              helperText={`${formData.direccion.length}/200 caracteres (mínimo 5)`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowEditModal(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button 
            onClick={updateCliente}
            variant="contained"
            sx={{ backgroundColor: "#ff8c42" }}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Ver Cliente */}
      <Dialog 
        open={showViewModal} 
        onClose={() => setShowViewModal(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Detalles del Cliente</DialogTitle>
        <DialogContent>
          {selectedCliente && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Cédula de Identidad"
                value={selectedCliente.ci}
                fullWidth
                disabled
              />
              <TextField
                label="Nombre Completo"
                value={selectedCliente.nombre}
                fullWidth
                disabled
              />
              <TextField
                label="Teléfono"
                value={selectedCliente.telefono}
                fullWidth
                disabled
              />
              <TextField
                label="Dirección"
                value={selectedCliente.direccion}
                fullWidth
                multiline
                rows={2}
                disabled
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewModal(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Eliminar Cliente */}
      <Dialog 
        open={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar al cliente{' '}
            <strong>{selectedCliente?.nombre}</strong> (CI: {selectedCliente?.ci})?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={deleteCliente}
            variant="contained"
            color="error"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars para mensajes */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
      >
        <Alert 
          onClose={() => setError('')} 
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess('')}
      >
        <Alert 
          onClose={() => setSuccess('')} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}
export default Clientes;
