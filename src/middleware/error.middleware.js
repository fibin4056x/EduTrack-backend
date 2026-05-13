export const errorHandler = (
  err,
  req,
  res,
  next
) => {
  let statusCode = err.statusCode || 500;

  let message =
    err.message || "Internal Server Error";



  /* =========================================
     MONGOOSE INVALID OBJECT ID
  ========================================= */
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
  }



  /* =========================================
     MONGOOSE VALIDATION ERROR
  ========================================= */
  if (err.name === "ValidationError") {
    statusCode = 400;

    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }



  /* =========================================
     MONGOOSE DUPLICATE KEY
  ========================================= */
  if (err.code === 11000) {
    statusCode = 409;

    const field = Object.keys(
      err.keyValue
    )[0];

    message = `${field} already exists`;
  }



  /* =========================================
     RESPONSE
  ========================================= */
  res.status(statusCode).json({
    success: false,
    message,

    ...(process.env.NODE_ENV ===
      "development" && {
      stack: err.stack,
    }),
  });
};