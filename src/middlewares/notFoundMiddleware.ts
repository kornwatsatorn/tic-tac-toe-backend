import { errorResponse } from "@/utils/responseHandler";
import { Request, Response, NextFunction } from "express";

// Middleware to handle unmatched routes (404 Not Found)
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  errorResponse(res, "Page not found", 404);
};
