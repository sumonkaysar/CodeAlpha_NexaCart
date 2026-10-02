const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected via Mongoose");
    console.log("Ready state:", mongoose.connection.readyState);
  } catch (err) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

module.exports = connectDB;
