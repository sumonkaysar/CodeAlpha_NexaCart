const mongoose = require("mongoose");
const Order = require("./order.model");
const Product = require("../product/product.model");

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

const createOrder = async (userId, items) => {
  if (!Array.isArray(items) || items.length === 0)
    throw createError("Your cart is empty", 400);

  if (items.length > 50) throw createError("Cart contains too many items", 400);

  const quantities = new Map();

  for (const item of items) {
    const productId = String(item?.productId || "");
    const quantity = Number(item?.quantity);

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 50
    ) {
      throw createError("Cart contains an invalid item", 400);
    }

    const totalQuantity = (quantities.get(productId) || 0) + quantity;

    if (totalQuantity > 50)
      throw createError("Maximum quantity per product is 50", 400);

    quantities.set(productId, totalQuantity);
  }

  const products = await Product.find({ _id: { $in: [...quantities.keys()] } });

  if (products.length !== quantities.size) {
    throw createError("One or more products are no longer available", 400);
  }

  const orderItems = products.map((product) => ({
    productId: product._id,
    name: product.name,
    price: product.price,
    quantity: quantities.get(String(product._id)),
  }));

  const totalAmount = Number(
    orderItems
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2),
  );

  const order = await Order.create({ userId, items: orderItems, totalAmount });

  return { orderId: order._id, totalAmount };
};

module.exports = { createOrder };
