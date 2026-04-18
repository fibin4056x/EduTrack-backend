import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // BASIC INFO
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      index: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },

    // SECURITY
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🔐 IMPORTANT
    },

    refresh_token: {
      type: String,
      select: false,
      default: null,
    },

    // ROLE SYSTEM (EXPANDABLE)
    role: {
      type: String,
      enum: ["admin", "principal", "teacher", "student"],
      default: "teacher",
      index: true,
    },

    // ACCOUNT STATUS
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },

    // SCHOOL CONTEXT (IMPORTANT FOR SLMS)
    school: {
      name: { type: String },
      code: { type: String }, // optional unique school identifier
    },

    // PROFILE DETAILS (EXTENDABLE)
    profile: {
      avatar: { type: String },
      gender: { type: String, enum: ["male", "female", "other"] },
      dob: { type: Date },
    },

    // ACTIVITY TRACKING
    lastLogin: {
      type: Date,
    },

    // SOFT DELETE
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// 🔍 COMPOUND INDEX (OPTIONAL OPTIMIZATION)
userSchema.index({ email: 1, phone: 1 });

export default mongoose.model("User", userSchema);