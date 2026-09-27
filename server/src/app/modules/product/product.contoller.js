const ProductService = require("./product.service");

const getAllProducts = async (req, res) => {
  try {
    const products = await ProductService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const ProductController = {
  getAllProducts,
  getProductById,
  createProduct,
};

module.exports = ProductController;
