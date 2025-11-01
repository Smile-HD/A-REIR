const router = require("express").Router();
const empleadoController = require("../../controllers/Administracion/empleadoController");
const authMiddleware = require("../../middlewares/authMiddleware");
const adminMiddleware = require("../../middlewares/adminMiddleware");

// Todas las rutas requieren autenticación y privilegios de administrador
// CREATE - Crear nuevo empleado
router.post("/", authMiddleware, adminMiddleware, empleadoController.createEmpleado);

// READ - Obtener todos los empleados
router.get("/", authMiddleware, adminMiddleware, empleadoController.getAllEmpleados);

// READ - Buscar empleados
router.get("/search", authMiddleware, adminMiddleware, empleadoController.searchEmpleados);

// READ - Obtener empleado por CI
router.get("/:ci", authMiddleware, adminMiddleware, empleadoController.getEmpleadoById);

// UPDATE - Actualizar empleado
router.put("/:ci", authMiddleware, adminMiddleware, empleadoController.updateEmpleado);

// DELETE - Eliminar empleado
router.delete("/:ci", authMiddleware, adminMiddleware, empleadoController.deleteEmpleado);

module.exports = router;