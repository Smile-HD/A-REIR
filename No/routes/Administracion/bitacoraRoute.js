const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/authMiddleware');
const adminOnly = require('../../middlewares/adminMiddleware');

const {
  listLogs,
  getLogById,
  deleteLog,
  clearLogs,
  listUsuariosConBitacora,
} = require('../../controllers/Administracion/bitacoraController');

// Todas las rutas de bitácora requieren estar autenticado y ser administrador
router.use(auth, adminOnly);

router.get('/usuarios', listUsuariosConBitacora);
router.get('/', listLogs);
router.get('/:id', getLogById);
router.delete('/:id', deleteLog);
router.delete('/', clearLogs); // requires ?before=YYYY-MM-DD

module.exports = router;
