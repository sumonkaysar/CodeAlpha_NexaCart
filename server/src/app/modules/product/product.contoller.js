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

const getAdminProducts = async (req, res) => {
  try {
    const products = await ProductService.getAdminProducts();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

const updateProduct = async (req, res) => {
  try {
    const product = await ProductService.updateProduct(req.params.id, req.body);

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const softDeleteProduct = async (req, res) => {
  try {
    const product = await ProductService.softDeleteProduct(req.params.id);

    res
      .status(200)
      .json({ message: "Product soft-deleted successfully", product });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const restoreProduct = async (req, res) => {
  try {
    const product = await ProductService.restoreProduct(req.params.id);

    res.status(200).json({ message: "Product restored successfully", product });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const hardDeleteProduct = async (req, res) => {
  try {
    const product = await ProductService.hardDeleteProduct(req.params.id);

    res
      .status(200)
      .json({ message: "Product permanently deleted", productId: product._id });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const ProductController = {
  getAllProducts,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
  hardDeleteProduct,
};

module.exports = ProductController;
