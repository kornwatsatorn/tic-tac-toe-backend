// src/utils/responseHandler.ts

import type { Response } from "express";

export const successResponse = (
  res: Response,
  message: string,
  data: unknown = {},
  statusCode: number = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 400 // Default status code if not specified
) => {
  res.status(statusCode).json({
    success: false,
    message
  });
};
