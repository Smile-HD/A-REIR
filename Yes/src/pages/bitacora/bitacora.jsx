import { useEffect, useMemo, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  MenuItem, Select, InputLabel, FormControl, Pagination, Stack, Alert
} from '@mui/material';
import { Delete as DeleteIcon, FilterAlt as FilterIcon, CleaningServices as ClearIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { API_BASE } from '../../utils/apiConfig';

function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export default function BitacoraPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [ip, setIp] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [order, setOrder] = useState('desc');

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set('page', String(page));
    p.set('pageSize', String(pageSize));
    if (q) p.set('q', q);
    if (ip) p.set('ip', ip);
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    if (usuarioId) p.set('usuarioId', usuarioId);
    if (order) p.set('order', order);
    return p.toString();
  }, [page, pageSize, q, ip, from, to, usuarioId, order]);

  const fetchUsuarios = async () => {
    try {
  const res = await fetch(`${API_BASE}/bitacora/usuarios`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      } else if (res.status === 403) {
        setError('No tienes permisos para ver la bitácora (solo administradores).');
      }
    } catch (e) {
      console.error('Error cargando usuarios bitácora', e);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
  const res = await fetch(`${API_BASE}/bitacora?${params}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRows(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else if (res.status === 403) {
        setRows([]);
        setError('No tienes permisos para ver la bitácora (solo administradores).');
      } else if (res.status === 401) {
        setRows([]);
        setError('Sesión no válida. Inicia sesión nuevamente.');
      } else {
        setRows([]);
        const data = await res.json().catch(() => ({}));
        setError(data.error || data.message || 'Error al cargar la bitácora');
      }
    } catch (e) {
      console.error('Error cargando bitácora', e);
      setError('Error de red al cargar la bitácora');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [params]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este registro de la bitácora?')) return;
    try {
  const res = await fetch(`${API_BASE}/bitacora/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchLogs();
      }
    } catch (e) {
      console.error('Error eliminando registro', e);
    }
  };

  const handleClearBefore = async () => {
    if (!from) {
      alert('Define una fecha "desde" para limpiar todos los registros anteriores a ese día.');
      return;
    }
    if (!window.confirm(`¿Eliminar todos los registros anteriores a ${from}? Esta acción no se puede deshacer.`)) return;
    try {
  const res = await fetch(`${API_BASE}/bitacora?before=${encodeURIComponent(from)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchLogs();
      }
    } catch (e) {
      console.error('Error limpiando bitácora', e);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Bitácora del sistema</Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'flex-end' }}>
          <TextField label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Descripción, usuario, email, empleado" fullWidth />
          <TextField label="IP" value={ip} onChange={(e) => setIp(e.target.value)} sx={{ minWidth: 160 }} />
          <TextField label="Desde" type="date" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="Hasta" type="date" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="usuario-label">Usuario</InputLabel>
            <Select labelId="usuario-label" label="Usuario" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
              <MenuItem value=""><em>Todos</em></MenuItem>
              {usuarios.map(u => (
                <MenuItem key={u.id} value={u.id}>
                  {u.usuario} {u.empleado ? `— ${u.empleado.nombre}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="order-label">Orden</InputLabel>
            <Select labelId="order-label" label="Orden" value={order} onChange={(e) => setOrder(e.target.value)}>
              <MenuItem value="desc">Recientes primero</MenuItem>
              <MenuItem value="asc">Antiguos primero</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<FilterIcon />} onClick={() => setPage(1)}>Aplicar</Button>
          <IconButton color="primary" onClick={fetchLogs} title="Refrescar">
            <RefreshIcon />
          </IconButton>
          <Button color="error" variant="outlined" startIcon={<ClearIcon />} onClick={handleClearBefore}>
            Limpiar antes de "Desde"
          </Button>
        </Stack>
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha/Hora</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Empleado</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>IP</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, idx) => (
                <TableRow key={r.id_bitacora ? String(r.id_bitacora) : `row-${idx}`} hover>
                  <TableCell>{formatDateTime(r.fecha_hora)}</TableCell>
                  <TableCell>{r.usuario ? r.usuario.usuario : '—'}</TableCell>
                  <TableCell>{r.usuario?.empleado?.nombre || '—'}</TableCell>
                  <TableCell>{r.descripcion || '—'}</TableCell>
                  <TableCell>{r.ip_origen || '—'}</TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => handleDelete(r.id_bitacora)} title="Eliminar registro">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    {loading ? 'Cargando...' : 'Sin resultados'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="psize">Filas</InputLabel>
            <Select labelId="psize" label="Filas" value={pageSize} onChange={(e) => { setPageSize(e.target.value); setPage(1); }}>
              {[10, 20, 50, 100].map(n => (
                <MenuItem key={n} value={n}>{n}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Pagination color="primary" page={page} count={totalPages} onChange={(e, v) => setPage(v)} />
        </Box>
      </Paper>
    </Box>
  );
}
