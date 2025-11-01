const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/authMiddleware');
const adminOnly = require('../../middlewares/adminMiddleware');
const {
  createServicio,
  getAllServicios,
  searchServicios,
  getServicioById,
  updateServicio,
  deleteServicio,
  getCategorias,
} = require('../../controllers/Administracion/servicioController');

router.use(auth);

router.get('/categorias', getCategorias);
router.get('/', getAllServicios);
router.get('/search', searchServicios);
router.get('/:id', getServicioById);

router.post('/', adminOnly, createServicio);
router.put('/:id', adminOnly, updateServicio);
router.delete('/:id', adminOnly, deleteServicio);

module.exports = router;
