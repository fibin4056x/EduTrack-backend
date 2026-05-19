import express from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import teacherRoutes from "../modules/teachers/teacher.routes.js";
import classRoutes from "../modules/class/class.routes.js";
import studentRoutes from "../modules/student/student.routes.js";
import divisionRoutes from "../modules/division/division.routes.js";
import attendanceRoutes from "../modules/attendance/attendance.routes.js";
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/teachers", teacherRoutes);
router.use("/classes", classRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/students", studentRoutes);
router.use("/divisions",divisionRoutes);
export default router;
