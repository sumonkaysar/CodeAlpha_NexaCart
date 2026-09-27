const OrderService = require("./order.service");

const createOrder = async (req, res) => {
  try {
    const result = await OrderService.createOrder(req.user.id, req.body.items);
    res.status(201).json({ message: "Order created successfully", ...result });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const OrderController = {
  createOrder,
};

module.exports = OrderController;
