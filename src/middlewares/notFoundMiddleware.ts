import { errorResponse } from "@/utils/responseHandler";
import type { Response } from "express";

// Middleware to handle unmatched routes (404 Not Found)
export const notFoundHandler = (res: Response) => {
  errorResponse(res, "Page not found", 404);
};
