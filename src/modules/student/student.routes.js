
import express from "express";

import upload
  from "../../middleware/upload.middleware.js";

import {
  bulkUploadStudents,
} from "./student.upload.controller.js";

import {
  createStudentController,
  getAllStudentsController,
  getStudentByIdController,
  updateStudentController,
  deleteStudentController,
  getStudentsByDivisionController,
} from "./student.controller.js";

import {
  authenticate,
} from "../../middleware/auth.middleware.js";

import {
  authorize,
} from "../../middleware/role.middleware.js";



const router =
  express.Router();



/* =========================================
   AUTH
========================================= */

router.use(authenticate);



/* =========================================
   BULK STUDENT UPLOAD
========================================= */

router.post(
  "/bulk-upload",
  authorize("principal"),
  upload.single("file"),
  bulkUploadStudents
);



/* =========================================
   CREATE STUDENT
========================================= */

router.post(
  "/",
  authorize("principal"),
  createStudentController
);



/* =========================================
   GET ALL STUDENTS
========================================= */

router.get(
  "/",
  authorize("principal"),
  getAllStudentsController
);



/* =========================================
   GET STUDENTS BY DIVISION
========================================= */

router.get(
  "/division/:divisionId",
  authorize(
    "principal",
    "teacher"
  ),
  getStudentsByDivisionController
);



/* =========================================
   GET STUDENT BY ID
========================================= */

router.get(
  "/:id",
  authorize("principal"),
  getStudentByIdController
);



/* =========================================
   UPDATE STUDENT
========================================= */

router.patch(
  "/:id",
  authorize(
    "principal",
    "teacher"
  ),
  updateStudentController
);



/* =========================================
   DELETE STUDENT
========================================= */

router.delete(
  "/:id",
  authorize("principal"),
  deleteStudentController
);



export default router;

