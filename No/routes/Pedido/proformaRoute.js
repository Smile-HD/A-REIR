const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/authMiddleware');
const {
  createProforma,
  getAllProformas,
  searchProformas,
  getProformaById,
  updateProforma,
  deleteProforma,
  addDetalle,
  deleteDetalle,
} = require('../../controllers/Pedido/proformaController');

router.use(auth);

router.get('/', getAllProformas);
router.get('/search', searchProformas);
router.get('/:id', getProformaById);
router.post('/', createProforma);
router.put('/:id', updateProforma);
router.delete('/:id', deleteProforma);
router.post('/:id/detalles', addDetalle);
router.delete('/:id/detalles/:detalleId', deleteDetalle);

module.exports = router;
