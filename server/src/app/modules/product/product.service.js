const mongoose = require("mongoose");
const Product = require("./product.model");

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

const getAllProducts = () =>
  Product.find({ deletedAt: null }).sort({ featured: -1, name: 1 });

const getAdminProducts = () => Product.find().sort({ deletedAt: 1, name: 1 });

const getProductById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw createError("Invalid product id", 400);
  const product = await Product.findOne({ _id: id, deletedAt: null });
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

const updateProduct = async (id, values) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw createError("Invalid product id", 400);

  const updates = {};
  if (values.name !== undefined) {
    if (typeof values.name !== "string" || !values.name.trim())
      throw createError("Product name cannot be empty", 400);
    updates.name = values.name.trim();
  }
  if (values.price !== undefined) {
    const price = Number(values.price);
    if (!Number.isFinite(price) || price <= 0)
      throw createError("Price must be a positive number", 400);
    updates.price = price;
  }
  if (values.description !== undefined) {
    if (typeof values.description !== "string")
      throw createError("Description must be text", 400);
    updates.description = values.description.trim();
  }
  if (values.category !== undefined) {
    if (typeof values.category !== "string" || !values.category.trim())
      throw createError("Category cannot be empty", 400);
    updates.category = values.category.trim();
  }
  if (values.image !== undefined) {
    if (typeof values.image !== "string")
      throw createError("Image URL must be text", 400);
    updates.image = values.image.trim();
  }
  if (values.featured !== undefined) {
    if (typeof values.featured !== "boolean")
      throw createError("Featured must be a boolean", 400);
    updates.featured = values.featured;
  }
  if (!Object.keys(updates).length)
    throw createError("Provide at least one product field to update", 400);

  const product = await Product.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!product) throw createError("Product not found", 404);
  return product;
};

const setProductDeletedAt = async (id, deletedAt) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw createError("Invalid product id", 400);
  const product = await Product.findByIdAndUpdate(
    id,
    { $set: { deletedAt } },
    { new: true },
  );
  if (!product) throw createError("Product not found", 404);
  return product;
};

const softDeleteProduct = (id) => setProductDeletedAt(id, new Date());
const restoreProduct = (id) => setProductDeletedAt(id, null);

const hardDeleteProduct = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw createError("Invalid product id", 400);
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw createError("Product not found", 404);
  return product;
};

module.exports = {
  getAllProducts,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
  hardDeleteProduct,
};
