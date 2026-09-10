require("dotenv").config();
const express = require("express");
const cors = require("cors");
const AuthRouter = require("./app/modules/auth/auth.route");
const ProductRouter = require("./app/modules/product/product.route");
const OrderRouter = require("./app/modules/order/order.route");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", AuthRouter);
app.use("/api/products", ProductRouter);
app.use("/api/orders", OrderRouter);

app.get("/", (_req, res) => {
  res.status(httpStatus.OK).json({
    message: "NexaCart server is on: 😎",
  });
});

module.exports = app;
