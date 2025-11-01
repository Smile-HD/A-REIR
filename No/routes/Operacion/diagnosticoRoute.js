const router = require("express").Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const {
  createDiagnostico,
  getAllDiagnosticos,
  getDiagnosticoById,
  updateDiagnostico,
  deleteDiagnostico,
  searchDiagnosticos,
  addDetalle,
  deleteDetalle
} = require("../../controllers/Operacion/diagnosticoController");

router.use(authMiddleware);

// CRUD
router.post("/", createDiagnostico);
router.get("/", getAllDiagnosticos);
router.get("/search", searchDiagnosticos);
router.get("/:id", getDiagnosticoById);
router.put("/:id", updateDiagnostico);
router.delete("/:id", deleteDiagnostico);

// Detalles
router.post("/:id/detalles", addDetalle);
router.delete("/:id/detalles/:detalleId", deleteDetalle);

module.exports = router;
