import mongoose from "mongoose";



const studentSchema = new mongoose.Schema(
  {
    /* =========================================
       ACADEMIC INFO
    ========================================= */

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    divisionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
      required: true,
    },

    admissionDate: {
      type: Date,
      required: true,
    },



    /* =========================================
       STUDENT BASIC INFO
    ========================================= */

    nameEnglish: {
      type: String,
      required: true,
      trim: true,
    },

    nameArabic: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: [
        "male",
        "female",
        "other",
      ],
      required: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },



    /* =========================================
       IDENTITY INFO
    ========================================= */

    examRegisterNumber: {
      type: String,
      trim: true,
    },

    aadhaarNumber: {
      type: String,
      trim: true,
    },



    /* =========================================
       ECONOMIC CATEGORY
    ========================================= */

    economicCategory: {
      type: String,
      enum: ["BPL", "APL"],
    },



    /* =========================================
       PHOTO
    ========================================= */

    photo: {
      type: String,
      default: "",
    },



    /* =========================================
       STATUS
    ========================================= */

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
      ],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);



const StudentModel = mongoose.model(
  "Student",
  studentSchema
);



export default StudentModel;