const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../user/user.model");

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

const register = async ({ username, email, password }) => {
  if (typeof username !== "string" || username.trim().length < 2) {
    throw createError("Name must be at least 2 characters", 400);
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    throw createError("Enter a valid email address", 400);
  }

  if (typeof password !== "string" || password.length < 8) {
    throw createError("Password must be at least 8 characters", 400);
  }

  try {
    const user = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: await bcrypt.hash(password, 10),
    });

    await user.save();

    return { message: "User registered successfully" };
  } catch (error) {
    if (error.code === 11000)
      throw createError("Username or email already exists", 400);

    throw error;
  }
};

const login = async ({ email, password }) => {
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string"
  ) {
    throw createError("Email and password are required", 400);
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) throw createError("Invalid email or password", 400);

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw createError("Invalid email or password", 400);

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" },
  );

  return { token, username: user.username, role: user.role };
};

module.exports = { register, login };
