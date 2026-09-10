const Product = require("./product.model");

const getAllProducts = async (req, res) => {
  try {
    let products = await Product.find();

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const ProductController = {
  getAllProducts,
};

module.exports = ProductController;
