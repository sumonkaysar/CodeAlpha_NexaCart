require("dotenv").config();
const express = require("express");
const cors = require("cors");
const AuthRouter = require("./app/modules/auth/auth.route");
const ProductRouter = require("./app/modules/product/product.route");
const OrderRouter = require("./app/modules/order/order.route");
const UploadRouter = require("./app/modules/upload/upload.route");
const notFoundMiddleware = require("./app/middlewares/notFoundMiddleware");
const errorHandlerMiddleware = require("./app/middlewares/errorHandlerMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", AuthRouter);
app.use("/api/products", ProductRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/uploads", UploadRouter);

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "NexaCart server is on: 😎",
  });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
