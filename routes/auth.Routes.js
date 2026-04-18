import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/auth.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// ================= AUTH =================
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// ================= USER (AUTH REQUIRED) =================

// 🔐 Get current user
router.get("/me", verifyToken, getMe);

export default router;