const express = require("express");
const router = express.Router();
const productController = require("../controllers/products");

router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/low-stock", productController.getLowStock);
router.get("/:id", productController.getProduct);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
