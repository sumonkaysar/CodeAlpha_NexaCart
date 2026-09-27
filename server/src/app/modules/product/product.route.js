const express = require("express");
const ProductController = require("./product.contoller");
const { verifyAdmin } = require("../../middlewares/authMiddleware");

const ProductRouter = express.Router();

ProductRouter.post("/", verifyAdmin, ProductController.createProduct);
ProductRouter.get("/", ProductController.getAllProducts);
ProductRouter.get("/:id", ProductController.getProductById);

module.exports = ProductRouter;
