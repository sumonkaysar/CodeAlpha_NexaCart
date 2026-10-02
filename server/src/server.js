require("dotenv").config();

const app = require("./app");
const connectDB = require("./app/config/db");
const seedAdmin = require("./app/utils/seedAdmin");
const seedProducts = require("./app/utils/seedProducts");

const PORT = process.env.PORT || 5000;

const main = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await seedProducts();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

main();
