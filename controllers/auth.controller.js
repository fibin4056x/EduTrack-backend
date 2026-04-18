import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================= CONFIG =================
const SALT_ROUNDS = 10;
const ACCESS_EXPIRE = "15m";
const REFRESH_EXPIRE = "7d";

// 🔐 Ensure secrets exist
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are not configured");
}

// ================= TOKEN HELPERS =================
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRE }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRE }
  );
};

// ================= SAFE RESPONSE =================
const buildUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email || null,
  phone: user.phone || null,
  role: user.role,
});

// ================= COOKIE CONFIG =================
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ✅ works local + Render
};

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    let { name, email, phone, password, role } = req.body;

    name = name?.trim();
    password = password?.trim();
    email = email?.trim().toLowerCase();
    phone = phone?.trim();
    role = role?.trim().toLowerCase() || "teacher";

    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const allowedRoles = ["principal", "teacher"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    const existing = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existing) {
      return res.status(409).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 🔐 Hash refresh token
    const hashedRefresh = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    user.refresh_token = hashedRefresh;
    await user.save();

    // 🍪 Set cookie
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(201).json({
      user: buildUser(user),
      accessToken,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    let { email, phone, password } = req.body;

    email = email?.trim().toLowerCase();
    phone = phone?.trim();
    password = password?.trim();

    if ((!email && !phone) || !password) {
      return res.status(400).json({ msg: "Credentials required" });
    }

    const user = await User.findOne(email ? { email } : { phone })
      .select("+password +refresh_token");

    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // 🚫 Block inactive users (if field exists)
    if (user.status && user.status !== "active") {
      return res.status(403).json({ msg: "Account is not active" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 🔄 Rotate refresh token
    const hashedRefresh = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    user.refresh_token = hashedRefresh;

    user.lastLogin = new Date();
    await user.save();

    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.json({
      user: buildUser(user),
      accessToken,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

// ================= REFRESH =================
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ msg: "No refresh token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id)
      .select("+refresh_token");

    if (!user) {
      return res.status(401).json({ msg: "Invalid user" });
    }

    const isValid = await bcrypt.compare(token, user.refresh_token);
    if (!isValid) {
      return res.status(403).json({ msg: "Invalid token" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // 🔄 Rotate again
    const hashedRefresh = await bcrypt.hash(newRefreshToken, SALT_ROUNDS);
    user.refresh_token = hashedRefresh;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, cookieOptions);

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ msg: "Refresh token expired" });
    }

    return res.status(403).json({ msg: "Invalid token" });
  }
};

// ================= LOGOUT =================
export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      const decoded = jwt.decode(token);

      if (decoded?.id) {
        const user = await User.findById(decoded.id)
          .select("+refresh_token");

        if (user) {
          user.refresh_token = null;
          await user.save();
        }
      }
    }

    res.clearCookie("refreshToken", cookieOptions);

    return res.json({ msg: "Logged out" });
  } catch (error) {
    return res.status(500).json({ msg: "Server error" });
  }
};
export const getMe = (req, res) => {
  res.json({
    user: req.user,
  });
};