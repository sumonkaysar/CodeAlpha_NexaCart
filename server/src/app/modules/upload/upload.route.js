const express = require("express");
const { verifyAdmin } = require("../../middlewares/authMiddleware");
const uploadImage = require("../../middlewares/imageUploadMiddleware");
const UploadController = require("./upload.controller");

const UploadRouter = express.Router();

UploadRouter.post("/image", verifyAdmin, uploadImage, UploadController.uploadImage);

module.exports = UploadRouter;