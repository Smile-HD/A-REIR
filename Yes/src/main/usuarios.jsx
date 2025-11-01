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
  FormControlLabel,
  Switch,
} from "@mui/material";
import { 
  Add, 
  Edit, 
  Delete, 
  Search, 
  Visibility, 
  Lock,
  AdminPanelSettings,
  Person,
  ArrowUpward,
  ArrowDownward
} from "@mui/icons-material";
import { useEffect, useState } from "react";

function Usuarios() {
  // Estados
  const [usuarios, setUsuarios] = useState([]);
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para paginación
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [sortBy, setSortBy] = useState('usuario');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showDemoteModal, setShowDemoteModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    empleado_ci: '',
    usuario: '',
    contrasena: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    contrasenaActual: '',
    contrasenaNueva: '',
    confirmarContrasena: ''
  });

  // Cargar usuarios con paginación
  const fetchUsuarios = async (currentPage = page, currentRowsPerPage = rowsPerPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentRowsPerPage.toString(),
        sortBy,
        sortOrder
      });

      const res = await fetch(`http://localhost:3000/usuarios?${params}`, {
        method: "GET",
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data.usuarios || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotalUsuarios(data.pagination?.totalUsuarios || 0);
        setIsSearching(false);
      } else {
        throw new Error('Error al obtener usuarios');
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Cargar empleados disponibles (sin usuario asignado)
  const fetchEmpleadosDisponibles = async () => {
    try {
      const res = await fetch("http://localhost:3000/empleados", {
        method: "GET",
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        // Filtrar empleados que no tienen usuario asignado
        const empleadosSinUsuario = data.empleados?.filter(emp => !emp.usuario) || [];
        setEmpleadosDisponibles(empleadosSinUsuario);
      }
    } catch (error) {
      console.error("Error al obtener empleados:", error);
    }
  };

  // Buscar usuarios con paginación
  const searchUsuarios = async (currentPage = 1) => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      setPage(1);
      fetchUsuarios(1, rowsPerPage);
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

      const res = await fetch(`http://localhost:3000/usuarios/search?${params}`, {
        method: "GET",
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data.usuarios || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotalUsuarios(data.pagination?.totalResults || 0);
        setPage(currentPage);
      } else {
        throw new Error('Error en la búsqueda');
      }
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      setError('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  // Crear usuario
  const createUsuario = async () => {
    try {
      const res = await fetch("http://localhost:3000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const data = await res.json();
        setSuccess('Usuario creado exitosamente');
        setShowCreateModal(false);
        resetForm();
        refreshData();
        fetchEmpleadosDisponibles(); // Actualizar lista de empleados disponibles
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al crear usuario');
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
      setError(error.message);
    }
  };

  // Actualizar usuario
  const updateUsuario = async () => {
    try {
      const res = await fetch(`http://localhost:3000/usuarios/${selectedUsuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          usuario: formData.usuario,
          email: formData.email
        })
      });
      
      if (res.ok) {
        setSuccess('Usuario actualizado exitosamente');
        setShowEditModal(false);
        resetForm();
        refreshData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al actualizar usuario');
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      setError(error.message);
    }
  };

  // Eliminar usuario
  const deleteUsuario = async () => {
    try {
      const res = await fetch(`http://localhost:3000/usuarios/${selectedUsuario.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (res.ok) {
        setSuccess('Usuario eliminado exitosamente');
        setShowDeleteModal(false);
        refreshData();
        fetchEmpleadosDisponibles(); // Actualizar lista de empleados disponibles
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      setError(error.message);
    }
  };

  // Cambiar contraseña
  const cambiarContrasena = async () => {
    try {
      if (passwordData.contrasenaNueva !== passwordData.confirmarContrasena) {
        setError('Las contraseñas no coinciden');
        return;
      }

      const res = await fetch(`http://localhost:3000/usuarios/${selectedUsuario.id}/cambiar-contrasena`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          contrasenaActual: passwordData.contrasenaActual,
          contrasenaNueva: passwordData.contrasenaNueva
        })
      });
      
      if (res.ok) {
        setSuccess('Contraseña cambiada exitosamente');
        setShowPasswordModal(false);
        resetPasswordForm();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      setError(error.message);
    }
  };

  // Promover usuario a administrador
  const promoverAdministrador = async () => {
    try {
      const res = await fetch(`http://localhost:3000/usuarios/${selectedUsuario.id}/promover-admin`, {
        method: "PUT",
        credentials: "include",
      });
      
      if (res.ok) {
        setSuccess('Usuario promovido a administrador exitosamente');
        setShowPromoteModal(false);
        refreshData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al promover usuario');
      }
    } catch (error) {
      console.error("Error al promover usuario:", error);
      setError(error.message);
    }
  };

  // Degradar administrador a usuario normal
  const degradarAdministrador = async () => {
    try {
      const res = await fetch(`http://localhost:3000/usuarios/${selectedUsuario.id}/degradar-admin`, {
        method: "PUT",
        credentials: "include",
      });
      
      if (res.ok) {
        setSuccess('Administrador degradado a usuario normal exitosamente');
        setShowDemoteModal(false);
        refreshData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al degradar administrador');
      }
    } catch (error) {
      console.error("Error al degradar administrador:", error);
      setError(error.message);
    }
  };

  // Funciones auxiliares
  const resetForm = () => {
    setFormData({
      empleado_ci: '',
      usuario: '',
      contrasena: '',
      email: ''
    });
    setSelectedUsuario(null);
  };

  const resetPasswordForm = () => {
    setPasswordData({
      contrasenaActual: '',
      contrasenaNueva: '',
      confirmarContrasena: ''
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const openEditModal = (usuario) => {
    setSelectedUsuario(usuario);
    setFormData({
      empleado_ci: usuario.empleado_ci,
      usuario: usuario.usuario,
      contrasena: '',
      email: usuario.email || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (usuario) => {
    setSelectedUsuario(usuario);
    setShowViewModal(true);
  };

  const openDeleteModal = (usuario) => {
    setSelectedUsuario(usuario);
    setShowDeleteModal(true);
  };

  const openPasswordModal = (usuario) => {
    setSelectedUsuario(usuario);
    resetPasswordForm();
    setShowPasswordModal(true);
  };

  const openPromoteModal = (usuario) => {
    setSelectedUsuario(usuario);
    setShowPromoteModal(true);
  };

  const openDemoteModal = (usuario) => {
    setSelectedUsuario(usuario);
    setShowDemoteModal(true);
  };

  // Manejar cambio de página
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    if (isSearching) {
      searchUsuarios(newPage);
    } else {
      fetchUsuarios(newPage, rowsPerPage);
    }
  };

  // Manejar cambio de filas por página
  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
    if (isSearching) {
      searchUsuarios(1);
    } else {
      fetchUsuarios(1, newRowsPerPage);
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setPage(1);
    fetchUsuarios(1, rowsPerPage);
  };

  useEffect(() => {
    fetchUsuarios();
    fetchEmpleadosDisponibles();
  }, []);

  // Refrescar datos después de operaciones CRUD
  const refreshData = () => {
    if (isSearching) {
      searchUsuarios(page);
    } else {
      fetchUsuarios(page, rowsPerPage);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">Gestión de Usuarios</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ backgroundColor: "#ff8c42" }}
          onClick={() => setShowCreateModal(true)}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {/* Controles de búsqueda y paginación */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Buscar usuario por nombre, email, CI o nombre del empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUsuarios()}
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
                    onClick={() => searchUsuarios(1)}
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
            `Mostrando ${usuarios.length} de ${totalUsuarios} resultados para "${searchTerm}"`
          ) : (
            `Mostrando ${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalUsuarios)} de ${totalUsuarios} usuarios`
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

      {/* Tabla de usuarios */}
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
                  <TableCell>Usuario</TableCell>
                  <TableCell>Empleado</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Actividad</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    <TableRow key={usuario.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {usuario.administrador ? (
                            <AdminPanelSettings color="warning" />
                          ) : (
                            <Person color="action" />
                          )}
                          <Typography variant="body2" fontWeight="bold">
                            {usuario.usuario}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {usuario.empleado.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            CI: {usuario.empleado.ci}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {usuario.email ? (
                          <Typography variant="body2">{usuario.email}</Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary" style={{ fontStyle: 'italic' }}>
                            Sin email
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {usuario.administrador ? (
                          <Chip 
                            label="Administrador" 
                            color="warning" 
                            size="small"
                            icon={<AdminPanelSettings />}
                          />
                        ) : (
                          <Chip 
                            label="Usuario" 
                            color="primary" 
                            size="small" 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {usuario._count?.bitacora || 0} registros
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="info" 
                          size="small"
                          onClick={() => openViewModal(usuario)}
                          title="Ver detalles"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => openEditModal(usuario)}
                          title="Editar"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          color="secondary" 
                          size="small"
                          onClick={() => openPasswordModal(usuario)}
                          title="Cambiar contraseña"
                        >
                          <Lock />
                        </IconButton>
                        {!usuario.administrador ? (
                          <IconButton 
                            color="success" 
                            size="small"
                            onClick={() => openPromoteModal(usuario)}
                            title="Promover a administrador"
                          >
                            <ArrowUpward />
                          </IconButton>
                        ) : (
                          <IconButton 
                            color="warning" 
                            size="small"
                            onClick={() => openDemoteModal(usuario)}
                            title="Degradar de administrador"
                          >
                            <ArrowDownward />
                          </IconButton>
                        )}
                        {!usuario.administrador && (
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => openDeleteModal(usuario)}
                            title="Eliminar"
                          >
                            <Delete />
                          </IconButton>
                        )}
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

      {/* Modal Crear Usuario */}
      <Dialog 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Nuevo Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Empleado</InputLabel>
              <Select
                name="empleado_ci"
                value={formData.empleado_ci}
                onChange={handleInputChange}
                label="Empleado"
              >
                {empleadosDisponibles.map((empleado) => (
                  <MenuItem key={empleado.ci} value={empleado.ci}>
                    {empleado.nombre} (CI: {empleado.ci})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="usuario"
              label="Nombre de Usuario"
              value={formData.usuario}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="contrasena"
              label="Contraseña"
              type="password"
              value={formData.contrasena}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="email"
              label="Email (Opcional)"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowCreateModal(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button 
            onClick={createUsuario}
            variant="contained"
            sx={{ backgroundColor: "#ff8c42" }}
          >
            Crear Usuario
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar Usuario */}
      <Dialog 
        open={showEditModal} 
        onClose={() => setShowEditModal(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="empleado_ci"
              label="Empleado"
              value={selectedUsuario?.empleado?.nombre || ''}
              fullWidth
              disabled
            />
            <TextField
              name="usuario"
              label="Nombre de Usuario"
              value={formData.usuario}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowEditModal(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button 
            onClick={updateUsuario}
            variant="contained"
            sx={{ backgroundColor: "#ff8c42" }}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Ver Usuario */}
      <Dialog 
        open={showViewModal} 
        onClose={() => setShowViewModal(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Detalles del Usuario</DialogTitle>
        <DialogContent>
          {selectedUsuario && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="ID Usuario"
                    value={selectedUsuario.id}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Nombre de Usuario"
                    value={selectedUsuario.usuario}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Empleado"
                    value={selectedUsuario.empleado?.nombre}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="CI Empleado"
                    value={selectedUsuario.empleado?.ci}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    value={selectedUsuario.email || 'Sin email asignado'}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Tipo de Usuario"
                    value={selectedUsuario.administrador ? 'Administrador' : 'Usuario'}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Registros de Actividad"
                    value={`${selectedUsuario._count?.bitacora || 0} registros`}
                    fullWidth
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

      {/* Modal Eliminar Usuario */}
      <Dialog 
        open={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar el usuario{' '}
            <strong>{selectedUsuario?.usuario}</strong> del empleado{' '}
            <strong>{selectedUsuario?.empleado?.nombre}</strong>?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer. El usuario no se puede eliminar si:
            - Es administrador del sistema
            - Tiene registros de actividad en la bitácora
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={deleteUsuario}
            variant="contained"
            color="error"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Cambiar Contraseña */}
      <Dialog 
        open={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Usuario: <strong>{selectedUsuario?.usuario}</strong>
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="contrasenaActual"
              label="Contraseña Actual"
              type="password"
              value={passwordData.contrasenaActual}
              onChange={handlePasswordChange}
              fullWidth
              required
            />
            <TextField
              name="contrasenaNueva"
              label="Nueva Contraseña"
              type="password"
              value={passwordData.contrasenaNueva}
              onChange={handlePasswordChange}
              fullWidth
              required
            />
            <TextField
              name="confirmarContrasena"
              label="Confirmar Nueva Contraseña"
              type="password"
              value={passwordData.confirmarContrasena}
              onChange={handlePasswordChange}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowPasswordModal(false); resetPasswordForm(); }}>
            Cancelar
          </Button>
          <Button 
            onClick={cambiarContrasena}
            variant="contained"
            sx={{ backgroundColor: "#ff8c42" }}
          >
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Promover a Administrador */}
      <Dialog 
        open={showPromoteModal} 
        onClose={() => setShowPromoteModal(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Promover a Administrador</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea promover al usuario{' '}
            <strong>{selectedUsuario?.usuario}</strong> del empleado{' '}
            <strong>{selectedUsuario?.empleado?.nombre}</strong> a administrador?
          </Typography>
          <Typography color="info.main" sx={{ mt: 2 }}>
            El usuario tendrá acceso completo a la gestión de usuarios y todas las funcionalidades administrativas del sistema.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPromoteModal(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={promoverAdministrador}
            variant="contained"
            color="success"
            startIcon={<ArrowUpward />}
          >
            Promover a Administrador
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Degradar de Administrador */}
      <Dialog 
        open={showDemoteModal} 
        onClose={() => setShowDemoteModal(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Degradar de Administrador</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea degradar al administrador{' '}
            <strong>{selectedUsuario?.usuario}</strong> del empleado{' '}
            <strong>{selectedUsuario?.empleado?.nombre}</strong> a usuario normal?
          </Typography>
          <Typography color="warning.main" sx={{ mt: 2 }}>
            El usuario perderá acceso a la gestión de usuarios y otras funcionalidades administrativas. 
            Esta acción no se puede deshacer automáticamente.
          </Typography>
          <Typography color="error.main" sx={{ mt: 1 }}>
            <strong>Nota:</strong> No se puede degradar al último administrador del sistema.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDemoteModal(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={degradarAdministrador}
            variant="contained"
            color="warning"
            startIcon={<ArrowDownward />}
          >
            Degradar a Usuario Normal
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

export default Usuarios;