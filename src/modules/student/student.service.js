import StudentModel from "./student.model.js";



export const createStudentService =
  async (studentData) => {

    const newStudent =
      await StudentModel.create(
        studentData
      );

    return await newStudent.populate([
      "classId",
      "divisionId",
    ]);
  };



export const getAllStudentsService =
  async () => {

    return await StudentModel.find()

      .populate("classId")

      .populate("divisionId")

      .sort({
        createdAt: -1,
      });
  };



export const getStudentByIdService =
  async (studentId) => {

    const student =
      await StudentModel.findById(
        studentId
      )

        .populate("classId")

        .populate("divisionId");



    if (!student) {
      throw new Error(
        "Student not found"
      );
    }

    return student;
  };



export const updateStudentService =
  async (
    studentId,
    updateData
  ) => {

    const updatedStudent =
      await StudentModel.findByIdAndUpdate(
        studentId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      )

        .populate("classId")

        .populate("divisionId");



    if (!updatedStudent) {
      throw new Error(
        "Student not found"
      );
    }

    return updatedStudent;
  };



export const deleteStudentService =
  async (studentId) => {

    const deletedStudent =
      await StudentModel.findByIdAndDelete(
        studentId
      );



    if (!deletedStudent) {
      throw new Error(
        "Student not found"
      );
    }

    return deletedStudent;
  };