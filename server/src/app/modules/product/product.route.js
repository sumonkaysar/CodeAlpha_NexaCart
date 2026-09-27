const express = require("express");
const ProductController = require("./product.contoller");
const { verifyAdmin } = require("../../middlewares/authMiddleware");

const ProductRouter = express.Router();

ProductRouter.post("/", verifyAdmin, ProductController.createProduct);
ProductRouter.get("/admin", verifyAdmin, ProductController.getAdminProducts);
ProductRouter.patch(
  "/:id/soft-delete",
  verifyAdmin,
  ProductController.softDeleteProduct,
);
ProductRouter.patch(
  "/:id/restore",
  verifyAdmin,
  ProductController.restoreProduct,
);
ProductRouter.patch("/:id", verifyAdmin, ProductController.updateProduct);
ProductRouter.delete("/:id", verifyAdmin, ProductController.hardDeleteProduct);
ProductRouter.get("/", ProductController.getAllProducts);
ProductRouter.get("/:id", ProductController.getProductById);

module.exports = ProductRouter;
