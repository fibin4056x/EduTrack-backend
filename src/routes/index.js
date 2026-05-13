import express from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import teacherRoutes from "../modules/teachers/teacher.routes.js";
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/teachers", teacherRoutes);

export default router;