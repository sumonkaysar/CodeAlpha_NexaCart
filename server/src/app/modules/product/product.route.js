const express = require("express");
const ProductController = require("./product.contoller");

const ProductRouter = express.Router();

ProductRouter.get("/", ProductController.getAllProducts);

module.exports = ProductRouter;
