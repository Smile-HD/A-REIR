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
} from "@mui/material";
import { Add, Edit, Delete, Search, Visibility } from "@mui/icons-material";
import { useEffect, useState } from "react";

function Empleados() {
  // Estados
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para paginación
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalEmpleados, setTotalEmpleados] = useState(0);
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
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
  const fetchEmpleados = async (currentPage = page, currentRowsPerPage = rowsPerPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentRowsPerPage.toString(),
        sortBy,
        sortOrder
      });

      const res = await fetch(`http://localhost:3000/empleados?${params}`, {
        method: "GET",
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        setEmpleados(data.empleados || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotalEmpleados(data.pagination?.totalEmpleados || 0);
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
  };

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

      const res = await fetch(`http://localhost:3000/empleados/search?${params}`, {
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
    try {
      const res = await fetch("http://localhost:3000/empleados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const data = await res.json();
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
    try {
      const res = await fetch(`http://localhost:3000/empleados/${selectedEmpleado.ci}`, {
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
      const res = await fetch(`http://localhost:3000/empleados/${selectedEmpleado.ci}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (res.ok) {
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

  // Manejar cambio de filas por página
  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
    if (isSearching) {
      searchEmpleados(1);
    } else {
      fetchEmpleados(1, newRowsPerPage);
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setPage(1);
    fetchEmpleados(1, rowsPerPage);
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

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
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">Gestión de Empleados</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ backgroundColor: "#ff8c42" }}
          onClick={() => setShowCreateModal(true)}
        >
          Nuevo Empleado
        </Button>
      </Box>

      {/* Controles de búsqueda y paginación */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Buscar empleado por CI, nombre, teléfono o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchEmpleados()}
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
                    size="small"
                    onClick={() => searchEmpleados(1)}
                    sx={{ backgroundColor: "#ff8c42", mr: 1 }}
                  >
                    Buscar
                  </Button>
                  {isSearching && (
                    <Button
                      variant="outlined"
                      size="small"
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
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Filas por página</InputLabel>
            <Select
              value={rowsPerPage}
              label="Filas por página"
              onChange={handleRowsPerPageChange}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
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
            size="small"
          />
        )}
      </Box>

      {/* Tabla de empleados */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
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
                    <TableCell colSpan={6} align="center">
                      No se encontraron empleados
                    </TableCell>
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
                          <Chip 
                            label={empleado.usuario.usuario} 
                            color="success" 
                            size="small" 
                          />
                        ) : (
                          <Chip 
                            label="Sin usuario" 
                            color="default" 
                            size="small" 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="info" 
                          size="small"
                          onClick={() => openViewModal(empleado)}
                          title="Ver detalles"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => openEditModal(empleado)}
                          title="Editar"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => openDeleteModal(empleado)}
                          title="Eliminar"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
            />
            <TextField
              name="nombre"
              label="Nombre Completo"
              value={formData.nombre}
              onChange={handleInputChange}
              fullWidth
              required
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
            />
            <TextField
              name="telefono"
              label="Teléfono"
              type="number"
              value={formData.telefono}
              onChange={handleInputChange}
              fullWidth
              required
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
            />
            <TextField
              name="telefono"
              label="Teléfono"
              type="number"
              value={formData.telefono}
              onChange={handleInputChange}
              fullWidth
              required
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
    </Box>
  );
}

export default Empleados;