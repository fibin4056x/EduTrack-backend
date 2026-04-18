import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.Routes.js";
import userRoutes from "./routes/user.routes.js";
dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes)
app.get("/", (req, res) => {

  res.send("API is running");
});

app.use("/api/users", userRoutes);


app.listen(5000, () => console.log("Server running"));