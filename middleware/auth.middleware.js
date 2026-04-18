import jwt from "jsonwebtoken";

// ================= VERIFY TOKEN =================
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const token =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    // ❌ No token
    if (!token) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing");
      return res.status(500).json({
        message: "Server configuration error",
      });
    }

    // ✅ VERIFY TOKEN
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ❗ Defensive check
    if (!decoded?.id || !decoded?.role) {
      return res.status(403).json({
        message: "Invalid token payload",
      });
    }

    req.user = decoded;

    next();
  } catch (err) {
    // 🔥 Handle specific cases
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({
        message: "Token expired",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({
        message: "Invalid token",
      });
    }

    console.error("AUTH ERROR:", err);

    return res.status(500).json({
      message: "Authentication failed",
    });
  }
};

// ================= ROLE BASED ACCESS =================
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access forbidden",
      });
    }

    next();
  };
};