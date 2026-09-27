require("dotenv").config();
const User = require("../modules/user/user.model");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });

    if (adminExists) {
      console.log("An admin user already exists. Skipping seed.");
      return;
    }

    const adminUser = new User({
      name: "System Admin",
      username: process.env.ADMIN_USERNAME || "admin",
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: await bcrypt.hash(
        process.env.ADMIN_PASSWORD || "Admin@12345",
        10,
      ),
      role: "admin",
    });

    await adminUser.save();
    console.log(
      `Admin account created successfully! Email: ${adminUser.email}`,
    );
  } catch (err) {
    console.error("Error seeding admin user:", err);
    process.exit(1);
  }
};

module.exports = seedAdmin;
