import ClassModel from "./class.model.js";



export const createClassService =
  async (classData) => {

    const existingClass =
      await ClassModel.findOne({
        name: classData.name,
        academicYear:
          classData.academicYear,
      });

    if (existingClass) {
      throw new Error(
        "Class already exists"
      );
    }

    const newClass =
      await ClassModel.create(
        classData
      );

    return newClass;
  };



export const getAllClassesService =
  async () => {

    const classes =
      await ClassModel.find();

    return classes;
  };



export const getClassByIdService =
  async (classId) => {

    const singleClass =
      await ClassModel.findById(
        classId
      );

    if (!singleClass) {
      throw new Error(
        "Class not found"
      );
    }

    return singleClass;
  };



export const updateClassService =
  async (classId, updateData) => {

    const updatedClass =
      await ClassModel.findByIdAndUpdate(
        classId,
        updateData,
        {
          new: true,
        }
      );

    if (!updatedClass) {
      throw new Error(
        "Class not found"
      );
    }

    return updatedClass;
  };



export const deleteClassService =
  async (classId) => {

    const deletedClass =
      await ClassModel.findByIdAndDelete(
        classId
      );

    if (!deletedClass) {
      throw new Error(
        "Class not found"
      );
    }

    return deletedClass;
  };