import express from "express";

import {
  createStudentController,
  getAllStudentsController,
  getStudentByIdController,
  updateStudentController,
  deleteStudentController,
} from "./student.controller.js";

import {
  authenticate,
} from "../../middleware/auth.middleware.js";

import {
  authorize,
} from "../../middleware/role.middleware.js";

const router =
  express.Router();



router.use(authenticate);

router.use(
  authorize("principal")
);



router.post(
  "/",
  createStudentController
);



router.get(
  "/",
  getAllStudentsController
);



router.get(
  "/:id",
  getStudentByIdController
);



router.patch(
  "/:id",
  updateStudentController
);



router.delete(
  "/:id",
  deleteStudentController
);



export default router;
