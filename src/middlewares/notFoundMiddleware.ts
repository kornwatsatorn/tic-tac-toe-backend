import { errorResponse } from "@/utils/responseHandler";
import type { Response, Request } from "express";

// Middleware to handle unmatched routes (404 Not Found)
export const notFoundHandler = (req: Request, res: Response) => {
  errorResponse(res, "Page not found", 404);
};
