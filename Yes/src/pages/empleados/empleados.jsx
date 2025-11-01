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
  Card,
} from "@mui/material";
import { useTheme } from '@mui/material/styles'
import { Add, Edit, Delete, Search, Visibility } from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import { API_BASE } from "../../utils/apiConfig";

function Empleados() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // Estados
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para paginación
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalEmpleados, setTotalEmpleados] = useState(0);
  const [sortBy] = useState('nombre');
  const [sortOrder] = useState('asc');
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    ci: '',
    nombre: '',
    fechanac: '',
    direccion: '',
    telefono: ''
  });

  // Cargar empleados con paginación
  const fetchEmpleados = useCallback(async (currentPageParam, currentRowsPerPageParam) => {
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

  const res = await fetch(`${API_BASE}/empleados?${params}`, {
        method: "GET",
        credentials: "include",
      });
      
      if (res.ok) {
        const json = await res.json();
        setEmpleados(json.empleados || []);
        setTotalPages(json.pagination?.totalPages || 0);
        setTotalEmpleados(json.pagination?.totalEmpleados || 0);
        setIsSearching(false);
      } else {
        throw new Error('Error al obtener empleados');
      }
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      setError('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortBy, sortOrder]);

  // Buscar empleados con paginación
  const searchEmpleados = async (currentPage = 1) => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      setPage(1);
      fetchEmpleados(1, rowsPerPage);
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

  const res = await fetch(`${API_BASE}/empleados/search?${params}`, {
        method: "GET",
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        setEmpleados(data.empleados || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotalEmpleados(data.pagination?.totalResults || 0);
        setPage(currentPage);
      } else {
        throw new Error('Error en la búsqueda');
      }
    } catch (error) {
      console.error("Error al buscar empleados:", error);
      setError('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  // Crear empleado
  const createEmpleado = async () => {
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
    if (!formData.fechanac) {
      setError('La fecha de nacimiento es obligatoria');
      return;
    }
    // Validar que la fecha de nacimiento no sea futura
    const fechaNac = new Date(formData.fechanac);
    const hoy = new Date();
    if (fechaNac > hoy) {
      setError('La fecha de nacimiento no puede ser futura');
      return;
    }
    // Validar edad mínima (18 años)
    const edad = Math.floor((hoy - fechaNac) / (365.25 * 24 * 60 * 60 * 1000));
    if (edad < 18) {
      setError('El empleado debe ser mayor de 18 años');
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
  const res = await fetch(`${API_BASE}/empleados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        await res.json();
        setSuccess('Empleado creado exitosamente');
        setShowCreateModal(false);
        resetForm();
        refreshData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al crear empleado');
      }
    } catch (error) {
      console.error("Error al crear empleado:", error);
      setError(error.message);
    }
  };

  // Actualizar empleado
  const updateEmpleado = async () => {
    // Validaciones del lado del cliente
    if (!formData.nombre || formData.nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }
    if (formData.nombre.length > 100) {
      setError('El nombre no puede exceder 100 caracteres');
      return;
    }
    if (!formData.fechanac) {
      setError('La fecha de nacimiento es obligatoria');
      return;
    }
    const fechaNac = new Date(formData.fechanac);
    const hoy = new Date();
    if (fechaNac > hoy) {
      setError('La fecha de nacimiento no puede ser futura');
      return;
    }
    const edad = Math.floor((hoy - fechaNac) / (365.25 * 24 * 60 * 60 * 1000));
    if (edad < 18) {
      setError('El empleado debe ser mayor de 18 años');
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
  const res = await fetch(`${API_BASE}/empleados/${selectedEmpleado.ci}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nombre: formData.nombre,
          fechanac: formData.fechanac,
          direccion: formData.direccion,
          telefono: formData.telefono
        })
      });
      
      if (res.ok) {
        await res.json();
        setSuccess('Empleado actualizado exitosamente');
        setShowEditModal(false);
        resetForm();
        refreshData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al actualizar empleado');
      }
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      setError(error.message);
    }
  };

  // Eliminar empleado
  const deleteEmpleado = async () => {
    try {
  const res = await fetch(`${API_BASE}/empleados/${selectedEmpleado.ci}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (res.ok) {
        await res.json();
        setSuccess('Empleado eliminado exitosamente');
        setShowDeleteModal(false);
        refreshData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar empleado');
      }
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      setError(error.message);
    }
  };

  // Funciones auxiliares
  const resetForm = () => {
    setFormData({
      ci: '',
      nombre: '',
      fechanac: '',
      direccion: '',
      telefono: ''
    });
    setSelectedEmpleado(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openEditModal = (empleado) => {
    setSelectedEmpleado(empleado);
    setFormData({
      ci: empleado.ci,
      nombre: empleado.nombre,
      fechanac: empleado.fechanac.split('T')[0], // Formato YYYY-MM-DD para input date
      direccion: empleado.direccion,
      telefono: empleado.telefono
    });
    setShowEditModal(true);
  };

  const openViewModal = (empleado) => {
    setSelectedEmpleado(empleado);
    setShowViewModal(true);
  };

  const openDeleteModal = (empleado) => {
    setSelectedEmpleado(empleado);
    setShowDeleteModal(true);
  };

  // Manejar cambio de página
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    if (isSearching) {
      searchEmpleados(newPage);
    } else {
      fetchEmpleados(newPage, rowsPerPage);
    }
  };

  // NOTE: handleRowsPerPageChange and clearSearch were removed because they were unused after UI updates

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  // Refrescar datos después de operaciones CRUD
  const refreshData = () => {
    if (isSearching) {
      searchEmpleados(page);
    } else {
      fetchEmpleados(page, rowsPerPage);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Calcular edad
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header responsive */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: 2,
        mb: 3
      }}>
        <Typography variant={isMobile ? 'h5' : 'h4'}>Gestión de Empleados</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ backgroundColor: "#ff8c42" }}
          onClick={() => setShowCreateModal(true)}
          fullWidth={isMobile}
          size={isMobile ? 'small' : 'medium'}
        >
          Nuevo Empleado
        </Button>
      </Box>

      {/* Controles de búsqueda y paginación (responsive) */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={8} md={6}>
          <TextField
            fullWidth
            placeholder="Buscar empleado por CI, nombre, teléfono o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchEmpleados()}
            size={isMobile ? 'small' : 'medium'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <TextField
            fullWidth
            placeholder="Filtrar"
            size={isMobile ? 'small' : 'medium'}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <Button
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
            onClick={() => searchEmpleados(1)}
            sx={{ backgroundColor: "#ff8c42" }}
          >
            Buscar
          </Button>
        </Grid>
      </Grid>

      {/* Información de resultados */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {isSearching ? (
            `Mostrando ${empleados.length} de ${totalEmpleados} resultados para "${searchTerm}"`
          ) : (
            `Mostrando ${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalEmpleados)} de ${totalEmpleados} empleados`
          )}
        </Typography>
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? 'small' : 'medium'}
          />
        )}
      </Box>

      {/* Contenido principal: Cards en móvil, Tabla en desktop */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            {isMobile ? (
              <Box>
                {empleados.length === 0 ? (
                  <Typography align="center">No se encontraron empleados</Typography>
                ) : (
                  empleados.map((empleado) => (
                    <Card key={empleado.ci} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>{empleado.nombre}</Typography>
                          <Typography variant="body2" color="text.secondary"><strong>CI:</strong> {empleado.ci}</Typography>
                          <Typography variant="body2" color="text.secondary"><strong>Edad:</strong> {calculateAge(empleado.fechanac)}</Typography>
                          <Typography variant="body2" color="text.secondary"><strong>Teléfono:</strong> {empleado.telefono}</Typography>
                          <Typography variant="body2" color="text.secondary"><strong>Usuario:</strong> {empleado.usuario?.usuario || 'Sin usuario'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" color="primary" onClick={() => openEditModal(empleado)} title="Editar"><Edit /></IconButton>
                          <IconButton size="small" color="error" onClick={() => openDeleteModal(empleado)} title="Eliminar"><Delete /></IconButton>
                        </Box>
                      </Box>
                    </Card>
                  ))
                )}
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell>CI</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Edad</TableCell>
                      <TableCell>Teléfono</TableCell>
                      <TableCell>Usuario Sistema</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {empleados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">No se encontraron empleados</TableCell>
                      </TableRow>
                    ) : (
                      empleados.map((empleado) => (
                        <TableRow key={empleado.ci} hover>
                          <TableCell>{empleado.ci}</TableCell>
                          <TableCell>{empleado.nombre}</TableCell>
                          <TableCell>{calculateAge(empleado.fechanac)} años</TableCell>
                          <TableCell>{empleado.telefono}</TableCell>
                          <TableCell>
                            {empleado.usuario ? (
                              <Chip label={empleado.usuario.usuario} color="success" size="small" />
                            ) : (
                              <Chip label="Sin usuario" color="default" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton color="info" size="small" onClick={() => openViewModal(empleado)} title="Ver detalles"><Visibility /></IconButton>
                            <IconButton color="primary" size="small" onClick={() => openEditModal(empleado)} title="Editar"><Edit /></IconButton>
                            <IconButton color="error" size="small" onClick={() => openDeleteModal(empleado)} title="Eliminar"><Delete /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Paginación inferior */}
        {totalPages > 1 && !loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>

      {/* Modal Crear Empleado */}
      <Dialog 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Nuevo Empleado</DialogTitle>
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
              name="fechanac"
              label="Fecha de Nacimiento"
              type="date"
              value={formData.fechanac}
              onChange={handleInputChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: new Date().toISOString().split('T')[0]
              }}
              helperText="Debe ser mayor de 18 años"
            />
            <TextField
              name="telefono"
              label="Teléfono"
              type="number"
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
            onClick={createEmpleado}
            variant="contained"
            sx={{ backgroundColor: "#ff8c42" }}
          >
            Crear Empleado
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar Empleado */}
      <Dialog 
        open={showEditModal} 
        onClose={() => setShowEditModal(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Editar Empleado</DialogTitle>
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
              name="fechanac"
              label="Fecha de Nacimiento"
              type="date"
              value={formData.fechanac}
              onChange={handleInputChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: new Date().toISOString().split('T')[0]
              }}
              helperText="Debe ser mayor de 18 años"
            />
            <TextField
              name="telefono"
              label="Teléfono"
              type="number"
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
            onClick={updateEmpleado}
            variant="contained"
            sx={{ backgroundColor: "#ff8c42" }}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Ver Empleado */}
      <Dialog 
        open={showViewModal} 
        onClose={() => setShowViewModal(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Detalles del Empleado</DialogTitle>
        <DialogContent>
          {selectedEmpleado && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Cédula de Identidad"
                    value={selectedEmpleado.ci}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Nombre Completo"
                    value={selectedEmpleado.nombre}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Fecha de Nacimiento"
                    value={formatDate(selectedEmpleado.fechanac)}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Edad"
                    value={`${calculateAge(selectedEmpleado.fechanac)} años`}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Teléfono"
                    value={selectedEmpleado.telefono}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Usuario del Sistema"
                    value={selectedEmpleado.usuario?.usuario || 'Sin usuario asignado'}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Dirección"
                    value={selectedEmpleado.direccion}
                    fullWidth
                    multiline
                    rows={2}
                    disabled
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewModal(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Eliminar Empleado */}
      <Dialog 
        open={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar al empleado{' '}
            <strong>{selectedEmpleado?.nombre}</strong> (CI: {selectedEmpleado?.ci})?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer. El empleado no se puede eliminar si tiene 
            diagnósticos, órdenes de trabajo o un usuario del sistema asociado.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={deleteEmpleado}
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
export default Empleados;