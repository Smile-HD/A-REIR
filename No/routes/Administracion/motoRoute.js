const router = require("express").Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const {
  createMoto,
  getAllMotos,
  getMotoByPlaca,
  updateMoto,
  deleteMoto,
  searchMotos,
  getMarcasMoto
} = require("../../controllers/Administracion/motoController");

router.use(authMiddleware);

router.get("/marcas", getMarcasMoto);
router.get("/search", searchMotos);
router.post("/", createMoto);
router.get("/", getAllMotos);
router.get("/:placa", getMotoByPlaca);
router.put("/:placa", updateMoto);
router.delete("/:placa", deleteMoto);

module.exports = router;
