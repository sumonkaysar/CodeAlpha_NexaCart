const express = require("express");
const authenticateToken = require("../../middlewares/authMiddleware");
const OrderController = require("./order.controller");

const OrderRouter = express.Router();

OrderRouter.post("/", authenticateToken, OrderController.createOrder);

module.exports = OrderRouter;
