const router = require("express").Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const authController = require("../../controllers/Administracion/authController");  

// Rutas de autenticación básica
router.post("/login", authController.login); 
router.post("/logout", authMiddleware, authController.logout);
router.get("/verificar", authMiddleware, authController.verificarSesion);

// Rutas de gestión de bloqueos
router.post("/desbloquear/:usuario_id", authMiddleware, authController.desbloquearUsuario);
router.get("/estado-bloqueo/:usuario_id", authMiddleware, authController.estadoBloqueoUsuario);
router.get("/usuarios-bloqueados", authMiddleware, authController.usuariosBloqueados);
router.get("/historial-bloqueos/:usuario_id", authMiddleware, authController.historialBloqueos);

module.exports = router;