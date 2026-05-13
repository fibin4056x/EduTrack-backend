import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../modules/user/user.model.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("DB connected");

    // optional for development
    await User.deleteMany({});

    // Principal
    await User.create({
      name: "Principal Admin",
      email: "admin@slms.com",
      password: "123456",
      role: "principal",
      isActive: true,
      status: "active",
    });

    // Teacher
    await User.create({
      name: "Teacher One",
      email: "teacher@slms.com",
      password: "123456",
      role: "teacher",
      isActive: true,
      status: "active",
    });

    console.log("Users seeded successfully");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();