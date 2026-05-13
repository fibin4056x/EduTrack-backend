import ApiError from "../utils/ApiError.js";

import { verifyAccessToken } from "../modules/auth/auth.tokens.js";

import { validateUserFromToken } from "../modules/auth/auth.service.js";



/* ==================================================
   EXTRACT TOKEN
================================================== */
const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;

  if (
    typeof authHeader === "string" &&
    authHeader.startsWith("Bearer ")
  ) {
    return authHeader.slice(7).trim();
  }

  return null;
};



/* ==================================================
   AUTHENTICATE USER
================================================== */
export const authenticate = async (
  req,
  res,
  next
) => {
  try {
    const token = getBearerToken(req);

    if (!token) {
      throw new ApiError(
        401,
        "Access token missing"
      );
    }

    const decoded =
      verifyAccessToken(token);

    const user =
      await validateUserFromToken(
        decoded.id
      );

    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      status: user.status,
    };

    next();
  } catch (error) {
    next(error);
  }
};