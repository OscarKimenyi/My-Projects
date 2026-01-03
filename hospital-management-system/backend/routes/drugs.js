const express = require("express");
const router = express.Router();
const drugController = require("../controllers/drugController");

router.get("/", drugController.getAllDrugs);
router.get("/search", drugController.searchDrugs);
router.get("/low-stock", drugController.getLowStock);
router.get("/:id", drugController.getDrugById);
router.post("/", drugController.createDrug);
router.put("/:id", drugController.updateDrug);
router.put("/:id/stock", drugController.updateStock);
router.delete("/:id", drugController.deleteDrug);

module.exports = router;
