// src/controllers/auth.controller.ts

import { Request, Response } from "express";
import {
  registerUser,
  signInUser,
  refreshAccessToken,
  getProfile,
  updateProfile,
} from "@/services/user.service";
import { successResponse, errorResponse } from "@/utils/responseHandler";

export const handleRegister = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);
    successResponse(res, "User registered successfully", user, 201);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const handelLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await signInUser(email, password);
    successResponse(res, "User signed in successfully", user);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const handleRefreshToken = async (req: Request, res: Response) => {
  try {
    const user = await refreshAccessToken(req.user);
    successResponse(res, "Access token refreshed successfully", user);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const handleGetProfile = async (req: Request, res: Response) => {
  try {
    const user = await getProfile(req.user);
    successResponse(res, "Get profile successfully", user);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};
export const handleUpdateProfile = async (req: Request, res: Response) => {
  try {
    const user = await updateProfile(
      req.user,
      req.body.displayName ?? undefined,
      req.body.displayImage ?? undefined
    );
    successResponse(res, "Update profile success", user);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};
