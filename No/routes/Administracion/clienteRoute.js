const router = require("express").Router();
const clienteController = require("../../controllers/Administracion/clienteController");
const authMiddleware = require("../../middlewares/authMiddleware");

// Todas las rutas requieren autenticación
// CREATE - Crear nuevo cliente
router.post("/", authMiddleware, clienteController.createCliente);

// READ - Obtener todos los clientes
router.get("/", authMiddleware, clienteController.getAllClientes);

// READ - Buscar clientes
router.get("/search", authMiddleware, clienteController.searchClientes);

// READ - Obtener cliente por CI
router.get("/:ci", authMiddleware, clienteController.getClienteById);

// UPDATE - Actualizar cliente
router.put("/:ci", authMiddleware, clienteController.updateCliente);

// DELETE - Eliminar cliente
router.delete("/:ci", authMiddleware, clienteController.deleteCliente);

module.exports = router;