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
} from "@mui/material";
import { Add, Edit, Delete, Search } from "@mui/icons-material";
import { useEffect } from "react";
import { useState } from "react";
import NuevoCliente from "./archivoventanaprueba";

function Clientes() {
  // Datos de ejemplo

  const [clientes, setClientes] = useState([]); // estado accesible en todo el componente
  useEffect(() => {
    async function getClientes() {
      try {
        const res = await fetch("http://localhost:3000/registro/clientes", {
          method: "GET",
          credentials: "include", // MUY IMPORTANTE para cookies
        });
        const data = await res.json();
        setClientes(data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    }
    getClientes();
  }, []);
// prueba de ventana
 const [showModal, setShowModal] = useState(false);
   
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Gestión de Clientes</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ backgroundColor: "#ff8c42" }}
          onClick={() => {setShowModal(true)}}
        >
          Nuevo Cliente
        </Button>
         <NuevoCliente show={showModal} onClose={() => setShowModal(false)} />
      </Box>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>CI</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Email</TableCell>

                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.ci} hover>
                  <TableCell>{cliente.ci}</TableCell>
                  <TableCell>{cliente.nombre}</TableCell>
                  <TableCell>{cliente.telefono}</TableCell>
                  <TableCell>{cliente.direccion}</TableCell>

                  <TableCell>
                    <Chip
                      label="activo"
                      // color={cliente.estado === 'Activo' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" size="small">
                      <Edit />
                    </IconButton>
                    <IconButton color="error" size="small">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default Clientes;
