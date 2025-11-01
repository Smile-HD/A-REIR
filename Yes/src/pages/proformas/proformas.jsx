import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Pagination,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { API_BASE } from "../../utils/apiConfig";

function toLocalDate(d) {
  try {
    return new Date(d).toISOString().substring(0, 10);
  } catch {
    return "";
  }
}
// Helper para parsear el objeto decimal tipo { s, e, d }
const parseDecimalObj = (v) => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  // objeto con d (array de dígitos), e (exponente), s (signo)
  if (typeof v === "object" && Array.isArray(v.d)) {
    try {
      const digits = v.d.map((d) => String(d)).join("");
      const len = digits.length;
      const exp = Number.isFinite(Number(v.e)) ? Number(v.e) : 0;
      const sign = v.s === -1 ? -1 : 1;
      const coeff = Number(digits);
      const value = coeff * Math.pow(10, exp - (len - 1));
      return sign * value;
    } catch (err) {
      return 0;
    }
  }
  // fallback
  const maybe = Number(String(v));
  return Number.isFinite(maybe) ? maybe : 0;
};

const formatNumber = (v) => {
  const n = parseDecimalObj(v);
  return n.toFixed(2);
};
// helper para convertir a número seguro
const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

function RowDetalleEditor({ detalles, setDetalles }) {
  const add = () =>
    setDetalles([
      ...detalles,
      { descripcion: "", cantidad: "1", precio_unit: "0" },
    ]);
  const remove = (idx) => setDetalles(detalles.filter((_, i) => i !== idx));
  const change = (idx, key, val) => {
    // si es cantidad, normalizamos a entero (cadena) inmediatamente
    if (key === "cantidad") {
      const n = Number(val);
      const intVal = Number.isFinite(n)
        ? String(Math.max(0, Math.round(n)))
        : "0";
      setDetalles(
        detalles.map((d, i) => (i === idx ? { ...d, cantidad: intVal } : d))
      );
    } else {
      setDetalles(
        detalles.map((d, i) => (i === idx ? { ...d, [key]: val } : d))
      );
    }
  };
  const total = detalles.reduce(
    (acc, d) =>
      acc + Math.round(toNumber(d.cantidad)) * toNumber(d.precio_unit),
    0
  );
  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography variant="subtitle1">Detalles</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={add}>
          Agregar
        </Button>
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Descripción</TableCell>
            <TableCell>Cantidad</TableCell>
            <TableCell>Precio Unitario</TableCell>
            <TableCell>Subtotal</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {detalles.map((d, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <TextField
                  size="small"
                  fullWidth
                  value={d.descripcion}
                  onChange={(e) => change(idx, "descripcion", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  inputProps={{ step: "1", min: "0" }}
                  value={d.cantidad}
                  onChange={(e) => change(idx, "cantidad", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={d.precio_unit}
                  onChange={(e) => change(idx, "precio_unit", e.target.value)}
                />
              </TableCell>
              <TableCell>
                {(
                  Math.round(toNumber(d.cantidad)) * toNumber(d.precio_unit)
                ).toFixed(2)}
              </TableCell>
              <TableCell align="right">
                <IconButton color="error" onClick={() => remove(idx)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {detalles.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Sin detalles
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell colSpan={3} align="right">
              <b>Total</b>
            </TableCell>
            <TableCell colSpan={2}>
              <b>{total.toFixed(2)}</b>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
}
export default function ProformasPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    fecha: toLocalDate(new Date()),
    cliente_ci: "",
    diagnostico_id: "",
    estado: "PENDIENTE",
  });
  const [detalles, setDetalles] = useState([]);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    if (q) p.set("q", q);
    if (estado) p.set("estado", estado);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    return p.toString();
  }, [page, pageSize, q, estado, from, to]);

  const fetchList = async () => {
    setLoading(true);
    setError("");
    try {
      const url =
        q || estado || from || to
          ? `${API_BASE}/proformas/search?${params}`
          : `${API_BASE}/proformas?${params}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // normalizar cada fila: total a número, y detalles si vienen embebidos
        const normalized = (data.data || []).map((r) => {
          const totalNum = parseDecimalObj(r.total);
          const detallesNorm = (r.detalle_proforma || []).map((d) => ({
            ...d,
            // forzamos cantidad a entero aquí
            cantidad: Math.round(parseDecimalObj(d.cantidad)),
            precio_unit: parseDecimalObj(d.precio_unit),
            subtotal: parseDecimalObj(d.subtotal),
          }));
          return { ...r, total: totalNum, detalle_proforma: detallesNorm };
        });
        setRows(normalized);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        setRows([]);
        setError(data.error || data.message || "Error al cargar proformas");
      }
    } catch (e) {
      console.error(e);
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [params]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      fecha: toLocalDate(new Date()),
      cliente_ci: "",
      diagnostico_id: "",
      estado: "PENDIENTE",
    });
    setDetalles([]);
    setOpen(true);
  };
  const openEdit = async (row) => {
    try {
      const res = await fetch(`${API_BASE}/proformas/${row.id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setEditing(row.id);
        setForm({
          fecha: toLocalDate(data.fecha),
          cliente_ci: data.cliente_ci || data.cliente?.ci || "",
          diagnostico_id: data.diagnostico_id || data.diagnostico?.nro || "",
          estado: data.estado,
        });
        // almacenar cantidades/precios como strings para inputs, parseando objetos decimales
        setDetalles(
          (data.detalle_proforma || []).map((d) => ({
            descripcion: d.descripcion || "",
            // cantidades como strings enteras para inputs
            cantidad: String(Math.round(parseDecimalObj(d.cantidad))),
            precio_unit: String(parseDecimalObj(d.precio_unit)),
            subtotal: parseDecimalObj(d.subtotal),
          }))
        );
        setOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const save = async () => {
    try {
      const payload = {
        ...form,
        cliente_ci: Number(form.cliente_ci) || undefined,
        diagnostico_id: form.diagnostico_id
          ? String(form.diagnostico_id)
          : undefined,
        fecha: form.fecha,
        estado: form.estado,
        detalles: detalles.map((d) => ({
          descripcion: d.descripcion,
          // enviamos cantidad como entero (number)
          cantidad: Math.round(toNumber(d.cantidad)),
          precio_unit: toNumber(d.precio_unit),
        })),
      };
      const res = await fetch(
        `${API_BASE}/proformas${editing ? `/${editing}` : ""}`,
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setOpen(false);
        fetchList();
      } else {
        alert(data.error || data.message || "Error al guardar");
      }
    } catch (e) {
      console.error(e);
      alert("Error de red");
    }
  };

  const remove = async (row) => {
    if (!window.confirm("¿Eliminar esta proforma?")) return;
    try {
      const res = await fetch(`${API_BASE}/proformas/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchList();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Proformas
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "flex-end" }}
        >
          <TextField
            label="Buscar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cliente, detalle..."
            fullWidth
          />
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel id="est">Estado</InputLabel>
            <Select
              labelId="est"
              label="Estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
              <MenuItem value="APROBADA">APROBADA</MenuItem>
              <MenuItem value="ANULADA">ANULADA</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Desde"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Hasta"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={() => setPage(1)}
          >
            Aplicar
          </Button>
          <IconButton onClick={fetchList}>
            <RefreshIcon />
          </IconButton>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
          >
            Nueva Proforma
          </Button>
        </Stack>
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{toLocalDate(r.fecha)}</TableCell>
                  <TableCell>{r.cliente?.nombre || r.cliente_ci}</TableCell>
                  <TableCell>{r.estado}</TableCell>
                  <TableCell align="right">{formatNumber(r.total)}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => openEdit(r)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => remove(r)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    {loading ? "Cargando..." : "Sin resultados"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <Pagination
            page={page}
            count={totalPages}
            onChange={(e, v) => setPage(v)}
          />
        </Box>
      </Paper>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editing ? `Editar Proforma #${editing}` : "Nueva Proforma"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <TextField
              label="Fecha"
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Cliente CI"
              type="number"
              value={form.cliente_ci}
              onChange={(e) => setForm({ ...form, cliente_ci: e.target.value })}
            />
            <TextField
              label="Diagnóstico # (opcional)"
              type="number"
              value={form.diagnostico_id}
              onChange={(e) =>
                setForm({ ...form, diagnostico_id: e.target.value })
              }
            />
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id="est2">Estado</InputLabel>
              <Select
                labelId="est2"
                label="Estado"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
              >
                <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
                <MenuItem value="APROBADA">APROBADA</MenuItem>
                <MenuItem value="ANULADA">ANULADA</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <RowDetalleEditor detalles={detalles} setDetalles={setDetalles} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={save}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
