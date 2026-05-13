import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { ENV } from "./config/env.js";

const app = express();

/* ================= CORS ================= */
const allowedOrigins = ENV.CLIENT_ORIGIN
  ? ENV.CLIENT_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked"));
    },
  })
);

/* ================= BODY ================= */
app.use(express.json());

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.json({ message: "SLMS API running" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
  });
});

/* ================= ROUTES ================= */
app.use("/api", routes);

/* ================= ERROR ================= */
app.use(errorHandler);

export default app;