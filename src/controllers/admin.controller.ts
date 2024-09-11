import type { Request, Response } from "express";
import { registerAdmin, signInAdmin } from "../services/admin.service";
import { successResponse, errorResponse } from "../utils/responseHandler";

export const handleRegister = async (req: Request, res: Response) => {
  try {
    const admin = await registerAdmin(req.body);
    successResponse(res, "Admin registered successfully", admin, 201);
  } catch (error) {
    if (error instanceof Error) {
      errorResponse(res, error.message);
    } else {
      // Handle unexpected errors that are not instances of Error
      errorResponse(res, "An unexpected error occurred.");
    }
  }
};

export const handelLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const admin = await signInAdmin(username, password);
    successResponse(res, "Admin signed in successfully", admin);
  } catch (error) {
    if (error instanceof Error) {
      errorResponse(res, error.message);
    } else {
      // Handle unexpected errors that are not instances of Error
      errorResponse(res, "An unexpected error occurred.");
    }
  }
};
