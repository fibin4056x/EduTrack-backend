import ApiError from "../utils/ApiError.js";



export const validateCreateTeacher = (
  req,
  res,
  next
) => {
  const { name, email, password } =
    req.body;



  if (!name || !email || !password) {
    return next(
      new ApiError(
        400,
        "Name, email and password are required"
      )
    );
  }



  if (password.length < 6) {
    return next(
      new ApiError(
        400,
        "Password must be at least 6 characters"
      )
    );
  }



  next();
};