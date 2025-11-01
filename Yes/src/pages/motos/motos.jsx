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
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Add, Edit, Delete, Search, Visibility } from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import { API_BASE } from "../../utils/apiConfig";

function Motos() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [motos, setMotos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalMotos, setTotalMotos] = useState(0);
  const [sortBy] = useState("placa");
  const [sortOrder] = useState("asc");
  const [isSearching, setIsSearching] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMoto, setSelectedMoto] = useState(null);

  const [formData, setFormData] = useState({
    placa: "",
    modelo: "",
    year: "",
    chasis: "",
    marca_id: ""
  });

  const fetchMarcas = useCallback(async () => {
    try {
  const res = await fetch(`${API_BASE}/motos/marcas`, {
        method: "GET",
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        setMarcas(data.marcas || []);
      } else {
        throw new Error("Error al obtener marcas");
      }
    } catch (err) {
      console.error("Error al obtener marcas de motos:", err);
      setError("Error al cargar marcas de motos");
    }
  }, []);

  const fetchMotos = useCallback(async (currentPageParam, currentRowsPerPageParam) => {
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

  const res = await fetch(`${API_BASE}/motos?${params}`, {
        method: "GET",
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        setMotos(data.motos || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotalMotos(data.pagination?.totalMotos || 0);
        setIsSearching(false);
      } else {
        throw new Error("Error al obtener motos");
      }
    } catch (err) {
      console.error("Error al obtener motos:", err);
      setError("Error al cargar motos");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortBy, sortOrder]);

  const searchMotos = async (currentPage = 1) => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      setPage(1);
      fetchMotos(1, rowsPerPage);
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

  const res = await fetch(`${API_BASE}/motos/search?${params}`, {
        method: "GET",
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        setMotos(data.motos || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotalMotos(data.pagination?.totalResults || 0);
        setPage(currentPage);
      } else {
        throw new Error("Error en la búsqueda");
      }
    } catch (err) {
      console.error("Error al buscar motos:", err);
      setError("Error en la búsqueda");
    } finally {
      setLoading(false);
    }
  };

  const createMoto = async () => {
    // Validaciones del lado del cliente
    if (!formData.placa || formData.placa.trim().length === 0) {
      setError('La placa es obligatoria');
      return;
    }
    if (formData.placa.length > 10) {
      setError('La placa no puede exceder 10 caracteres');
      return;
    }
    if (!formData.modelo || formData.modelo.trim().length < 2) {
      setError('El modelo debe tener al menos 2 caracteres');
      return;
    }
    if (formData.modelo.length > 50) {
      setError('El modelo no puede exceder 50 caracteres');
      return;
    }
    if (!formData.year || formData.year === '') {
      setError('El año es obligatorio');
      return;
    }
    const yearNum = Number(formData.year);
    const currentYear = new Date().getFullYear();
    if (yearNum < 1900 || yearNum > currentYear + 1) {
      setError(`El año debe estar entre 1900 y ${currentYear + 1}`);
      return;
    }
    if (formData.chasis && formData.chasis.length > 30) {
      setError('El número de chasis no puede exceder 30 caracteres');
      return;
    }
    if (!formData.marca_id) {
      setError('Debe seleccionar una marca');
      return;
    }

    try {
      const payload = {
        placa: formData.placa.trim().toUpperCase(),
        modelo: formData.modelo.trim(),
        year: Number(formData.year),
        chasis: formData.chasis ? formData.chasis.trim().toUpperCase() : null,
        marca_id: Number(formData.marca_id)
      };

  const res = await fetch(`${API_BASE}/motos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await res.json();
        setSuccess("Moto creada exitosamente");
        setShowCreateModal(false);
        resetForm();
        refreshData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al crear moto");
      }
    } catch (err) {
      console.error("Error al crear moto:", err);
      setError(err.message);
    }
  };

  const updateMoto = async () => {
    if (!selectedMoto) {
      return;
    }

    // Validaciones del lado del cliente
    if (!formData.modelo || formData.modelo.trim().length < 2) {
      setError('El modelo debe tener al menos 2 caracteres');
      return;
    }
    if (formData.modelo.length > 50) {
      setError('El modelo no puede exceder 50 caracteres');
      return;
    }
    if (!formData.year || formData.year === '') {
      setError('El año es obligatorio');
      return;
    }
    const yearNum = Number(formData.year);
    const currentYear = new Date().getFullYear();
    if (yearNum < 1900 || yearNum > currentYear + 1) {
      setError(`El año debe estar entre 1900 y ${currentYear + 1}`);
      return;
    }
    if (formData.chasis && formData.chasis.length > 30) {
      setError('El número de chasis no puede exceder 30 caracteres');
      return;
    }
    if (!formData.marca_id) {
      setError('Debe seleccionar una marca');
      return;
    }

    try {
      const payload = {
        modelo: formData.modelo.trim(),
        year: Number(formData.year),
        chasis: formData.chasis ? formData.chasis.trim().toUpperCase() : "",
        marca_id: Number(formData.marca_id)
      };

  const res = await fetch(`${API_BASE}/motos/${selectedMoto.placa}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess("Moto actualizada exitosamente");
        setShowEditModal(false);
        resetForm();
        refreshData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al actualizar moto");
      }
    } catch (err) {
      console.error("Error al actualizar moto:", err);
      setError(err.message);
    }
  };

  const deleteMoto = async () => {
    if (!selectedMoto) {
      return;
    }

    try {
  const res = await fetch(`${API_BASE}/motos/${selectedMoto.placa}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (res.ok) {
        setSuccess("Moto eliminada exitosamente");
        setShowDeleteModal(false);
        refreshData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al eliminar moto");
      }
    } catch (err) {
      console.error("Error al eliminar moto:", err);
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      placa: "",
      modelo: "",
      year: "",
      chasis: "",
      marca_id: ""
    });
    setSelectedMoto(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "placa" || name === "chasis"
          ? value.toUpperCase()
          : value
    }));
  };

  const openEditModal = (moto) => {
    setSelectedMoto(moto);
    setFormData({
      placa: moto.placa,
      modelo: moto.modelo,
      year: moto.year?.toString() || "",
      chasis: moto.chasis || "",
      marca_id: moto.marca_id?.toString() || ""
    });
    setShowEditModal(true);
  };

  const openViewModal = (moto) => {
    setSelectedMoto(moto);
    setShowViewModal(true);
  };

  const openDeleteModal = (moto) => {
    setSelectedMoto(moto);
    setShowDeleteModal(true);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    if (isSearching) {
      searchMotos(newPage);
    } else {
      fetchMotos(newPage, rowsPerPage);
    }
  };

  const handleRowsPerPageChange = (event) => {
    const newRows = parseInt(event.target.value, 10) || 10;
    setRowsPerPage(newRows);
    setPage(1);
    if (isSearching) {
      searchMotos(1);
    } else {
      fetchMotos(1, newRows);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
    setPage(1);
    fetchMotos(1, rowsPerPage);
  };

  useEffect(() => {
    fetchMarcas();
  }, [fetchMarcas]);

  useEffect(() => {
    fetchMotos();
  }, [fetchMotos]);

  const refreshData = () => {
    if (isSearching) {
      searchMotos(page);
    } else {
      fetchMotos(page, rowsPerPage);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            gap: isMobile ? 2 : 0
          }}
        >
          <Typography variant={isMobile ? "h5" : "h4"}>Gestión de Motos</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            fullWidth={isMobile}
            sx={{ maxWidth: isMobile ? "100%" : "220px", backgroundColor: "#ff8c42" }}
            onClick={() => setShowCreateModal(true)}
          >
            Nueva Moto
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            placeholder="Buscar por placa, modelo, chasis o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchMotos()}
            size={isMobile ? "small" : "medium"}
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
                    size={isMobile ? "small" : "medium"}
                    onClick={() => searchMotos(1)}
                    sx={{ backgroundColor: "#ff8c42", mr: 1 }}
                    fullWidth={isMobile}
                  >
                    Buscar
                  </Button>
                  {isSearching && (
                    <Button
                      variant="outlined"
                      size={isMobile ? "small" : "medium"}
                      onClick={clearSearch}
                    >
                      Limpiar
                    </Button>
                  )}
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="number"
            placeholder="10"
            size={isMobile ? "small" : "medium"}
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
            onClick={() => searchMotos(1)}
            sx={{ backgroundColor: "#ff8c42" }}
          >
            Buscar
          </Button>
        </Grid>
      </Grid>

      <Grid container alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <Typography variant="body2" color="text.secondary">
            {isSearching ? (
              `Mostrando ${motos.length} de ${totalMotos} resultados para "${searchTerm}"`
            ) : (
              `Mostrando ${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalMotos)} de ${totalMotos} motos`
            )}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}
        >
          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size={isSmUp ? "medium" : "small"}
            />
          )}
        </Grid>
      </Grid>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            {isMobile ? (
              <Box>
                {motos.length === 0 ? (
                  <Typography align="center">No se encontraron motos</Typography>
                ) : (
                  motos.map((moto) => (
                    <Card key={moto.placa} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <Box>
                          <Typography variant="h6">{moto.placa}</Typography>
                          <Typography variant="body2" color="text.secondary">Modelo: {moto.modelo}</Typography>
                          <Typography variant="body2" color="text.secondary">Año: {moto.year}</Typography>
                          <Typography variant="body2" color="text.secondary">Marca: {moto.marca_moto?.nombre || "Sin marca"}</Typography>
                          <Typography variant="body2" color="text.secondary">Chasis: {moto.chasis || "No registrado"}</Typography>
                        </Box>
                        <Box>
                          <IconButton size="small" color="info" onClick={() => openViewModal(moto)} title="Ver detalles"><Visibility /></IconButton>
                          <IconButton size="small" color="primary" onClick={() => openEditModal(moto)} title="Editar"><Edit /></IconButton>
                          <IconButton size="small" color="error" onClick={() => openDeleteModal(moto)} title="Eliminar"><Delete /></IconButton>
                        </Box>
                      </Box>
                    </Card>
                  ))
                )}
              </Box>
            ) : (
              <Box sx={{ width: "100%", overflowX: "visible" }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableRow>
                        <TableCell>Placa</TableCell>
                        <TableCell>Modelo</TableCell>
                        <TableCell>Año</TableCell>
                        <TableCell>Marca</TableCell>
                        <TableCell>Chasis</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {motos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">No se encontraron motos</TableCell>
                        </TableRow>
                      ) : (
                        motos.map((moto) => (
                          <TableRow key={moto.placa} hover>
                            <TableCell>{moto.placa}</TableCell>
                            <TableCell>{moto.modelo}</TableCell>
                            <TableCell>{moto.year}</TableCell>
                            <TableCell>{moto.marca_moto?.nombre || "Sin marca"}</TableCell>
                            <TableCell>{moto.chasis || "No registrado"}</TableCell>
                            <TableCell>
                              <IconButton color="info" size="small" onClick={() => openViewModal(moto)} title="Ver detalles"><Visibility /></IconButton>
                              <IconButton color="primary" size="small" onClick={() => openEditModal(moto)} title="Editar"><Edit /></IconButton>
                              <IconButton color="error" size="small" onClick={() => openDeleteModal(moto)} title="Eliminar"><Delete /></IconButton>
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 2,
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 1 : 0
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              size={isSmUp ? "medium" : "small"}
            />
          </Box>
        )}
      </Paper>

      <Dialog
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nueva Moto</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              name="placa"
              label="Placa"
              value={formData.placa}
              onChange={handleInputChange}
              fullWidth
              required
              inputProps={{ 
                style: { textTransform: "uppercase" },
                maxLength: 10
              }}
              helperText={`${formData.placa.length}/10 caracteres`}
            />
            <TextField
              name="modelo"
              label="Modelo"
              value={formData.modelo}
              onChange={handleInputChange}
              fullWidth
              required
              inputProps={{ 
                maxLength: 50,
                minLength: 2
              }}
              helperText={`${formData.modelo.length}/50 caracteres (mínimo 2)`}
            />
            <TextField
              name="year"
              label="Año"
              type="number"
              value={formData.year}
              onChange={handleInputChange}
              fullWidth
              required
              inputProps={{
                min: 1900,
                max: new Date().getFullYear() + 1
              }}
              helperText={`Año entre 1900 y ${new Date().getFullYear() + 1}`}
            />
            <TextField
              name="chasis"
              label="Chasis"
              value={formData.chasis}
              onChange={handleInputChange}
              fullWidth
              placeholder="Opcional"
              inputProps={{ 
                style: { textTransform: "uppercase" },
                maxLength: 30
              }}
              helperText={`${formData.chasis.length}/30 caracteres (opcional)`}
            />
            <FormControl fullWidth required>
              <InputLabel id="marca-select-create">Marca</InputLabel>
              <Select
                labelId="marca-select-create"
                name="marca_id"
                value={formData.marca_id}
                label="Marca"
                onChange={handleInputChange}
              >
                {marcas.length === 0 && (
                  <MenuItem value="" disabled>
                    No hay marcas disponibles
                  </MenuItem>
                )}
                {marcas.map((marca) => (
                  <MenuItem key={marca.id} value={marca.id.toString()}>
                    {marca.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowCreateModal(false);
              resetForm();
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={createMoto}
            variant="contained"
            sx={{ backgroundColor: "#ff8c42" }}
          >
            Crear Moto
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Moto</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              name="placa"
              label="Placa"
              value={formData.placa}
              fullWidth
              disabled
            />
            <TextField
              name="modelo"
              label="Modelo"
              value={formData.modelo}
              onChange={handleInputChange}
              fullWidth
              required
              inputProps={{ 
                maxLength: 50,
                minLength: 2
              }}
              helperText={`${formData.modelo.length}/50 caracteres (mínimo 2)`}
            />
            <TextField
              name="year"
              label="Año"
              type="number"
              value={formData.year}
              onChange={handleInputChange}
              fullWidth
              required
              inputProps={{
                min: 1900,
                max: new Date().getFullYear() + 1
              }}
              helperText={`Año entre 1900 y ${new Date().getFullYear() + 1}`}
            />
            <TextField
              name="chasis"
              label="Chasis"
              value={formData.chasis}
              onChange={handleInputChange}
              fullWidth
              placeholder="Opcional"
              inputProps={{ 
                style: { textTransform: "uppercase" },
                maxLength: 30
              }}
              helperText={`${formData.chasis.length}/30 caracteres (opcional)`}
            />
            <FormControl fullWidth required>
              <InputLabel id="marca-select-edit">Marca</InputLabel>
              <Select
                labelId="marca-select-edit"
                name="marca_id"
                value={formData.marca_id}
                label="Marca"
                onChange={handleInputChange}
              >
                {marcas.length === 0 && (
                  <MenuItem value="" disabled>
                    No hay marcas disponibles
                  </MenuItem>
                )}
                {marcas.map((marca) => (
                  <MenuItem key={marca.id} value={marca.id.toString()}>
                    {marca.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowEditModal(false);
              resetForm();
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={updateMoto}
            variant="contained"
            sx={{ backgroundColor: "#ff8c42" }}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalles de la Moto</DialogTitle>
        <DialogContent>
          {selectedMoto && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField label="Placa" value={selectedMoto.placa} fullWidth disabled />
              <TextField label="Modelo" value={selectedMoto.modelo} fullWidth disabled />
              <TextField label="Año" value={selectedMoto.year} fullWidth disabled />
              <TextField
                label="Marca"
                value={selectedMoto.marca_moto?.nombre || "Sin marca"}
                fullWidth
                disabled
              />
              <TextField
                label="Chasis"
                value={selectedMoto.chasis || "No registrado"}
                fullWidth
                disabled
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar la moto con placa {" "}
            <strong>{selectedMoto?.placa}</strong>?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button onClick={deleteMoto} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess("")}>
        <Alert onClose={() => setSuccess("")} severity="success" sx={{ width: "100%" }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Motos;
