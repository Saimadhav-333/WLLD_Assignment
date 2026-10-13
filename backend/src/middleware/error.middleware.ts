import { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err?.code === 11000) {
    res.status(409).json({
      success: false,
      message: "An account with this email already exists",
    });
    return;
  }

  if (err?.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  console.error("Unexpected error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
