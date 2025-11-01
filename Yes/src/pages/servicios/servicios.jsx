import { useEffect, useMemo, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Select, MenuItem, InputLabel, FormControl,
  Pagination, Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import { API_BASE } from '../../utils/apiConfig';

export default function ServiciosPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [categorias, setCategorias] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ descripcion: '', categoria_id: '' });

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set('page', String(page));
    p.set('pageSize', String(pageSize));
    if (q) p.set('q', q);
    return p.toString();
  }, [page, pageSize, q]);

  const fetchCategorias = async () => {
    try {
  const res = await fetch(`${API_BASE}/servicios/categorias`, { credentials: 'include' });
      if (res.ok) setCategorias(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchList = async () => {
    setLoading(true); setError('');
    try {
  const url = q ? `${API_BASE}/servicios/search?${params}` : `${API_BASE}/servicios?${params}`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setRows(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        setRows([]); setError(data.error || data.message || 'Error al cargar servicios');
      }
    } catch (e) { console.error(e); setError('Error de red'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategorias(); }, []);
  useEffect(() => { fetchList(); }, [params]);

  const openCreate = () => { setEditing(null); setForm({ descripcion: '', categoria_id: '' }); setOpen(true); };
  const openEdit = (row) => { setEditing(row.id); setForm({ descripcion: row.descripcion, categoria_id: row.categoria_id || row.categoria?.id || '' }); setOpen(true); };

  const save = async () => {
    // Validaciones del lado del cliente
    if (!form.descripcion || form.descripcion.trim().length < 3) {
      alert('La descripción debe tener al menos 3 caracteres');
      return;
    }
    if (form.descripcion.length > 200) {
      alert('La descripción no puede exceder 200 caracteres');
      return;
    }
    if (!form.categoria_id) {
      alert('Debe seleccionar una categoría');
      return;
    }

    try {
      const payload = { ...form, categoria_id: Number(form.categoria_id) };
  const res = await fetch(`${API_BASE}/servicios${editing ? `/${editing}` : ''}`, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setOpen(false); fetchList(); }
      else { alert(data.error || data.message || 'Error al guardar'); }
    } catch (e) { console.error(e); alert('Error de red'); }
  };

  const remove = async (row) => {
    if (!window.confirm('¿Eliminar este servicio?')) return;
    try {
  const res = await fetch(`${API_BASE}/servicios/${row.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchList();
      else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Error al eliminar');
      }
    } catch (e) { console.error(e); }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Servicios</Typography>
      {error && (<Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>)}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'flex-end' }}>
          <TextField label="Buscar" value={q} onChange={e => setQ(e.target.value)} placeholder="Descripción del servicio" fullWidth />
          <Button variant="contained" startIcon={<SearchIcon/>} onClick={() => setPage(1)}>Aplicar</Button>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" startIcon={<AddIcon/>} onClick={openCreate}>Nuevo Servicio</Button>
        </Stack>
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.descripcion}</TableCell>
                  <TableCell>{r.categoria?.nombre || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => openEdit(r)}><EditIcon/></IconButton>
                    <IconButton color="error" onClick={() => remove(r)}><DeleteIcon/></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>{loading ? 'Cargando...' : 'Sin resultados'}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination page={page} count={totalPages} onChange={(e,v)=>setPage(v)} />
        </Box>
      </Paper>

      <Dialog open={open} onClose={()=>setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField 
              label="Descripción" 
              value={form.descripcion} 
              onChange={e => setForm({ ...form, descripcion: e.target.value })} 
              fullWidth 
              required
              inputProps={{ 
                maxLength: 200,
                minLength: 3
              }}
              helperText={`${form.descripcion.length}/200 caracteres (mínimo 3)`}
            />
            <FormControl fullWidth required>
              <InputLabel id="cat">Categoría</InputLabel>
              <Select labelId="cat" label="Categoría" value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })}>
                {categorias.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={save}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
