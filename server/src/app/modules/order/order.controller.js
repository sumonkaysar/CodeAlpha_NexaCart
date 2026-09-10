const Order = require("./order.model");

const createOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    const order = new Order({
      userId: req.user.id,
      items,
      totalAmount,
    });
    await order.save();
    res
      .status(201)
      .json({ message: "Order created successfully", orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const OrderController = {
  createOrder,
};

module.exports = OrderController;
