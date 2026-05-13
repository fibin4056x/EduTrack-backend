import {
  createTeacherService,
  getAllTeacherService,
  getTeacherByIdService,
  updateTeacherStatusService,
} from "./teacher.service.js";



export const createTeacher = async (
  req,
  res
) => {
  try {
    const teacherData =
      await createTeacherService(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Teacher created successfully",
      data: teacherData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



export const getAllTeachers = async (
  req,
  res
) => {
  try {
    const teachers =
      await getAllTeacherService();

    res.status(200).json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



export const getTeacherById = async (
  req,
  res
) => {
  try {
    const teacher =
      await getTeacherByIdService(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



export const updateTeacherStatus =
  async (req, res) => {
    try {
      const teacher =
        await updateTeacherStatusService(
          req.params.id,
          req.body.status
        );

      res.status(200).json({
        success: true,
        message:
          "Teacher status updated successfully",
        data: teacher,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };