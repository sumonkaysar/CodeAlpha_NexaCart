const UploadService = require("./upload.service");

const uploadImage = (req, res) => {
  try {
    res.status(201).json({
      message: "Image uploaded successfully",
      ...UploadService.getImageDetails(req.file),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

module.exports = { uploadImage };
