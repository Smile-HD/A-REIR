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
  Chip
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Add, Edit, Delete, Search, Visibility } from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import { API_BASE } from "../../utils/apiConfig";

function Diagnosticos() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy] = useState("fecha");
  const [sortOrder] = useState("desc");
  const [isSearching, setIsSearching] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    placa_moto: "",
    empleado_ci: "",
    detalles: []
  });

  const [marcas, setMarcas] = useState([]); // opcional si luego mostramos marcas

  const fetchList = useCallback(async (currentPageParam, currentRowsPerPageParam) => {
    const currentPage = typeof currentPageParam === "number" ? currentPageParam : page;
    const currentRowsPerPage = typeof currentRowsPerPageParam === "number" ? currentRowsPerPageParam : rowsPerPage;
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentRowsPerPage.toString(),
        sortBy,
        sortOrder
      });
  const res = await fetch(`${API_BASE}/diagnosticos?${params}`, { method: "GET", credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setItems(data.diagnosticos || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotalItems(data.pagination?.totalDiagnosticos || 0);
        setIsSearching(false);
      } else {
        throw new Error("Error al obtener diagnósticos");
      }
    } catch (err) {
      console.error("Error al obtener diagnósticos:", err);
      setError("Error al cargar diagnósticos");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortBy, sortOrder]);

  const searchList = async (currentPage = 1) => {
    if (!searchTerm.trim() && !fechaInicio && !fechaFin) {
      setIsSearching(false);
      setPage(1);
      fetchList(1, rowsPerPage);
      return;
    }
    try {
      setLoading(true);
      setIsSearching(true);
      const params = new URLSearchParams({
        q: searchTerm,
        fechaInicio: fechaInicio || "",
        fechaFin: fechaFin || "",
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
        sortBy,
        sortOrder
      });
  const res = await fetch(`${API_BASE}/diagnosticos/search?${params}`, { method: "GET", credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setItems(data.diagnosticos || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotalItems(data.pagination?.totalResults || 0);
        setPage(currentPage);
      } else {
        throw new Error("Error en la búsqueda");
      }
    } catch (err) {
      console.error("Error en búsqueda de diagnósticos:", err);
      setError("Error en la búsqueda");
    } finally {
      setLoading(false);
    }
  };

  const createItem = async () => {
    try {
      const payload = {
        ...formData,
        placa_moto: formData.placa_moto.trim().toUpperCase(),
        empleado_ci: Number(formData.empleado_ci),
        detalles: formData.detalles.filter((d) => d.descripcion && d.descripcion.trim().length > 0)
      };
  const res = await fetch(`${API_BASE}/diagnosticos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await res.json();
        setSuccess("Diagnóstico creado");
        setShowCreateModal(false);
        resetForm();
        refreshData();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Error al crear diagnóstico");
      }
    } catch (err) {
      console.error("Error al crear diagnóstico:", err);
      setError(err.message);
    }
  };

  const updateItem = async () => {
    if (!selected) return;
    try {
      const payload = {
        fecha: formData.fecha,
        hora: formData.hora,
        placa_moto: formData.placa_moto ? formData.placa_moto.trim().toUpperCase() : undefined,
        empleado_ci: formData.empleado_ci ? Number(formData.empleado_ci) : undefined,
        detalles: formData.detalles
      };
  const res = await fetch(`${API_BASE}/diagnosticos/${selected.nro}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccess("Diagnóstico actualizado");
        setShowEditModal(false);
        resetForm();
        refreshData();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Error al actualizar diagnóstico");
      }
    } catch (err) {
      console.error("Error al actualizar diagnóstico:", err);
      setError(err.message);
    }
  };

  const deleteItem = async () => {
    if (!selected) return;
    try {
  const res = await fetch(`${API_BASE}/diagnosticos/${selected.nro}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setSuccess("Diagnóstico eliminado");
        setShowDeleteModal(false);
        refreshData();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Error al eliminar diagnóstico");
      }
    } catch (err) {
      console.error("Error al eliminar diagnóstico:", err);
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({ fecha: "", hora: "", placa_moto: "", empleado_ci: "", detalles: [] });
    setSelected(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'placa_moto' ? value.toUpperCase() : value }));
  };

  const addDetalleRow = () => {
    setFormData((prev) => ({ ...prev, detalles: [...prev.detalles, { descripcion: "" }] }));
  };

  const updateDetalleRow = (index, value) => {
    setFormData((prev) => {
      const next = [...prev.detalles];
      next[index] = { descripcion: value };
      return { ...prev, detalles: next };
    });
  };

  const removeDetalleRow = (index) => {
    setFormData((prev) => {
      const next = prev.detalles.filter((_, i) => i !== index);
      return { ...prev, detalles: next };
    });
  };

  const openEditModal = (row) => {
    setSelected(row);
    setFormData({
      fecha: row.fecha?.slice(0, 10) || "",
      hora: row.hora ? new Date(row.hora).toTimeString().slice(0, 8) : "",
      placa_moto: row.placa_moto,
      empleado_ci: row.empleado_ci?.toString() || "",
      detalles: (row.detalle_diagnostico || []).map((d) => ({ descripcion: d.descripcion }))
    });
    setShowEditModal(true);
  };

  const openViewModal = (row) => {
    setSelected(row);
    setShowViewModal(true);
  };

  const openDeleteModal = (row) => {
    setSelected(row);
    setShowDeleteModal(true);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    if (isSearching) {
      searchList(newPage);
    } else {
      fetchList(newPage, rowsPerPage);
    }
  };

  const handleRowsPerPageChange = (event) => {
    const newRows = parseInt(event.target.value, 10) || 10;
    setRowsPerPage(newRows);
    setPage(1);
    if (isSearching) {
      searchList(1);
    } else {
      fetchList(1, newRows);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFechaInicio("");
    setFechaFin("");
    setIsSearching(false);
    setPage(1);
    fetchList(1, rowsPerPage);
  };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const refreshData = () => {
    if (isSearching) {
      searchList(page);
    } else {
      fetchList(page, rowsPerPage);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? 2 : 0 }}>
          <Typography variant={isMobile ? 'h5' : 'h4'}>Gestión de Diagnósticos</Typography>
          <Button variant="contained" startIcon={<Add />} fullWidth={isMobile} sx={{ maxWidth: isMobile ? '100%' : '220px', backgroundColor: '#ff8c42' }} onClick={() => setShowCreateModal(true)}>Nuevo Diagnóstico</Button>
        </Box>
      </Box>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth placeholder="Buscar por placa, modelo o empleado..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && searchList()} size={isMobile ? 'small' : 'medium'} InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField fullWidth type="date" label="Desde" InputLabelProps={{ shrink: true }} value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} size={isMobile ? 'small' : 'medium'} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField fullWidth type="date" label="Hasta" InputLabelProps={{ shrink: true }} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} size={isMobile ? 'small' : 'medium'} />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button variant="contained" fullWidth={isMobile} size={isMobile ? 'small' : 'medium'} onClick={() => searchList(1)} sx={{ backgroundColor: '#ff8c42' }}>Buscar</Button>
        </Grid>
      </Grid>

      <Grid container alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <Typography variant="body2" color="text.secondary">
            {isSearching ? (
              `Mostrando ${items.length} de ${totalItems} resultados`
            ) : (
              `Mostrando ${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalItems)} de ${totalItems} diagnósticos`
            )}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          {totalPages > 1 && (
            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size={isSmUp ? 'medium' : 'small'} />
          )}
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            {isMobile ? (
              <Box>
                {items.length === 0 ? (
                  <Typography align="center">No se encontraron diagnósticos</Typography>
                ) : (
                  items.map((row) => (
                    <Card key={row.nro} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Typography variant="h6">Diag #{String(row.nro)}</Typography>
                          <Typography variant="body2" color="text.secondary">Fecha: {row.fecha?.slice(0,10)} {row.hora && new Date(row.hora).toTimeString().slice(0,5)}</Typography>
                          <Typography variant="body2" color="text.secondary">Placa: {row.placa_moto}</Typography>
                          <Typography variant="body2" color="text.secondary">Empleado: {row.empleado?.nombre || row.empleado_ci}</Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {(row.detalle_diagnostico || []).slice(0,3).map((d, idx) => (
                              <Chip key={idx} label={d.descripcion} size="small" />
                            ))}
                          </Box>
                        </Box>
                        <Box>
                          <IconButton size="small" color="info" onClick={() => openViewModal(row)} title="Ver detalles"><Visibility /></IconButton>
                          <IconButton size="small" color="primary" onClick={() => openEditModal(row)} title="Editar"><Edit /></IconButton>
                          <IconButton size="small" color="error" onClick={() => openDeleteModal(row)} title="Eliminar"><Delete /></IconButton>
                        </Box>
                      </Box>
                    </Card>
                  ))
                )}
              </Box>
            ) : (
              <Box sx={{ width: '100%', overflowX: 'visible' }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Hora</TableCell>
                        <TableCell>Placa</TableCell>
                        <TableCell>Empleado</TableCell>
                        <TableCell>Detalles</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">No se encontraron diagnósticos</TableCell>
                        </TableRow>
                      ) : (
                        items.map((row) => (
                          <TableRow key={row.nro} hover>
                            <TableCell>{String(row.nro)}</TableCell>
                            <TableCell>{row.fecha?.slice(0,10)}</TableCell>
                            <TableCell>{row.hora && new Date(row.hora).toTimeString().slice(0,5)}</TableCell>
                            <TableCell>{row.placa_moto}</TableCell>
                            <TableCell>{row.empleado?.nombre || row.empleado_ci}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {(row.detalle_diagnostico || []).slice(0,3).map((d, idx) => (
                                  <Chip key={idx} label={d.descripcion} size="small" />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <IconButton color="info" size="small" onClick={() => openViewModal(row)} title="Ver detalles"><Visibility /></IconButton>
                              <IconButton color="primary" size="small" onClick={() => openEditModal(row)} title="Editar"><Edit /></IconButton>
                              <IconButton color="error" size="small" onClick={() => openDeleteModal(row)} title="Eliminar"><Delete /></IconButton>
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

        {totalPages > 1 && !loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 1 : 0 }}>
            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" showFirstButton showLastButton size={isSmUp ? 'medium' : 'small'} />
          </Box>
        )}
      </Paper>

      {/* Create dialog */}
      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Diagnóstico</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField name="fecha" label="Fecha" type="date" InputLabelProps={{ shrink: true }} value={formData.fecha} onChange={handleInputChange} fullWidth required />
            <TextField name="hora" label="Hora" type="time" InputLabelProps={{ shrink: true }} value={formData.hora} onChange={handleInputChange} fullWidth required />
            <TextField name="placa_moto" label="Placa" value={formData.placa_moto} onChange={handleInputChange} fullWidth required inputProps={{ style: { textTransform: 'uppercase' } }} />
            <TextField name="empleado_ci" label="CI Empleado" type="number" value={formData.empleado_ci} onChange={handleInputChange} fullWidth required />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Detalles</Typography>
              {formData.detalles.map((d, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField fullWidth placeholder="Descripción" value={d.descripcion} onChange={(e) => updateDetalleRow(idx, e.target.value)} />
                  <Button color="error" onClick={() => removeDetalleRow(idx)}>Quitar</Button>
                </Box>
              ))}
              <Button variant="outlined" onClick={addDetalleRow}>Agregar detalle</Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowCreateModal(false); resetForm(); }}>Cancelar</Button>
          <Button onClick={createItem} variant="contained" sx={{ backgroundColor: '#ff8c42' }}>Crear</Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Diagnóstico</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField name="fecha" label="Fecha" type="date" InputLabelProps={{ shrink: true }} value={formData.fecha} onChange={handleInputChange} fullWidth />
            <TextField name="hora" label="Hora" type="time" InputLabelProps={{ shrink: true }} value={formData.hora} onChange={handleInputChange} fullWidth />
            <TextField name="placa_moto" label="Placa" value={formData.placa_moto} onChange={handleInputChange} fullWidth inputProps={{ style: { textTransform: 'uppercase' } }} />
            <TextField name="empleado_ci" label="CI Empleado" type="number" value={formData.empleado_ci} onChange={handleInputChange} fullWidth />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Detalles</Typography>
              {formData.detalles.map((d, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField fullWidth placeholder="Descripción" value={d.descripcion} onChange={(e) => updateDetalleRow(idx, e.target.value)} />
                  <Button color="error" onClick={() => removeDetalleRow(idx)}>Quitar</Button>
                </Box>
              ))}
              <Button variant="outlined" onClick={addDetalleRow}>Agregar detalle</Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowEditModal(false); resetForm(); }}>Cancelar</Button>
          <Button onClick={updateItem} variant="contained" sx={{ backgroundColor: '#ff8c42' }}>Actualizar</Button>
        </DialogActions>
      </Dialog>

      {/* View dialog */}
      <Dialog open={showViewModal} onClose={() => setShowViewModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle del Diagnóstico</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="#" value={String(selected.nro)} fullWidth disabled />
              <TextField label="Fecha" value={selected.fecha?.slice(0,10)} fullWidth disabled />
              <TextField label="Hora" value={selected.hora && new Date(selected.hora).toTimeString().slice(0,5)} fullWidth disabled />
              <TextField label="Placa" value={selected.placa_moto} fullWidth disabled />
              <TextField label="Empleado" value={selected.empleado?.nombre || selected.empleado_ci} fullWidth disabled />
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Detalles</Typography>
                {(selected.detalle_diagnostico || []).map((d, idx) => (
                  <TextField key={idx} value={d.descripcion} fullWidth disabled sx={{ mb: 1 }} />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar el diagnóstico <strong>#{selected?.nro}</strong>?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button onClick={deleteItem} variant="contained" color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert onClose={() => setError("")} severity="error" sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess("")}>
        <Alert onClose={() => setSuccess("")} severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
    </Container>
  );
}

export default Diagnosticos;
