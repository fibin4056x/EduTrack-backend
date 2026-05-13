import express from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import teacherRoutes from "../modules/teachers/teacher.routes.js";
import classRoutes
  from "../modules/division/class.routes.js";
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/teachers", teacherRoutes);
router.use(
  "/classes",
  classRoutes
); 
export default router;