const mongoose = require("mongoose");
const Product = require("./product.model");

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

const getAllProducts = () => Product.find().sort({ featured: -1, name: 1 });

const getProductById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw createError("Invalid product id", 400);
  const product = await Product.findById(id);
  if (!product) throw createError("Product not found", 404);
  return product;
};

const createProduct = async ({
  name,
  price,
  description,
  image,
  category,
  featured,
}) => {
  const parsedPrice = Number(price);
  if (
    typeof name !== "string" ||
    !name.trim() ||
    !Number.isFinite(parsedPrice) ||
    parsedPrice <= 0
  ) {
    throw createError("A name and positive price are required", 400);
  }

  return Product.create({
    name: name.trim(),
    price: parsedPrice,
    description,
    image,
    category,
    featured,
  });
};

module.exports = { getAllProducts, getProductById, createProduct };
