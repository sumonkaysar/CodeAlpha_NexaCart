const getImageDetails = (file) => {
  if (!file?.path || !file?.filename) {
    throw Object.assign(new Error("Image upload did not return a Cloudinary URL"), { statusCode: 502 });
  }

  return { url: file.path, publicId: file.filename };
};

module.exports = { getImageDetails };