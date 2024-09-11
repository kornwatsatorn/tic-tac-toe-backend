import { ObjectId } from "mongodb";
import type { Request, Response } from "express";
import {
  registerUser,
  signInUser,
  refreshAccessToken,
  getProfile,
  updateProfile,
  getUserList
} from "@/services/user.service";
import { successResponse, errorResponse } from "@/utils/responseHandler";
import type { IUser } from "@/types/user";
import type { FilterQuery } from "mongoose";

export const handleRegister = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);
    successResponse(res, "User registered successfully", user, 201);
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
    const { email, password } = req.body;
    const user = await signInUser(email, password);
    successResponse(res, "User signed in successfully", user);
  } catch (error) {
    if (error instanceof Error) {
      errorResponse(res, error.message);
    } else {
      // Handle unexpected errors that are not instances of Error
      errorResponse(res, "An unexpected error occurred.");
    }
  }
};

export const handleRefreshToken = async (req: Request, res: Response) => {
  try {
    const user = await refreshAccessToken(req.user);
    successResponse(res, "Access token refreshed successfully", user);
  } catch (error) {
    if (error instanceof Error) {
      errorResponse(res, error.message);
    } else {
      // Handle unexpected errors that are not instances of Error
      errorResponse(res, "An unexpected error occurred.");
    }
  }
};

export const handleGetProfile = async (req: Request, res: Response) => {
  try {
    const user = await getProfile(req.user);
    successResponse(res, "Get profile successfully", user);
  } catch (error) {
    if (error instanceof Error) {
      errorResponse(res, error.message);
    } else {
      // Handle unexpected errors that are not instances of Error
      errorResponse(res, "An unexpected error occurred.");
    }
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
  } catch (error) {
    if (error instanceof Error) {
      errorResponse(res, error.message);
    } else {
      // Handle unexpected errors that are not instances of Error
      errorResponse(res, "An unexpected error occurred.");
    }
  }
};

export const handleUserList = async (req: Request, res: Response) => {
  try {
    const { search, page = 1, perPage = 10 } = req.query;
    // filter
    const filter: FilterQuery<IUser> = {};

    if (search) {
      const searchString = search.toString();
      const searchCriteria: FilterQuery<IUser>[] = [
        // Check if search is a valid ObjectId
        ObjectId.isValid(searchString)
          ? { _id: new ObjectId(searchString) }
          : undefined,

        // Use regex for partial matches in email and displayName
        { email: { $regex: searchString, $options: "i" } }, // 'i' for case-insensitive
        { displayName: { $regex: searchString, $options: "i" } },

        // Ensure point is a valid number before adding to criteria
        !isNaN(Number(searchString))
          ? { point: parseInt(searchString) }
          : undefined
      ].filter((item): item is FilterQuery<IUser> => item !== undefined); // Filter out undefined values

      if (searchCriteria.length > 0) {
        filter.$or = searchCriteria;
      }
    }

    const userList = await getUserList(
      parseInt(page.toString()),
      parseInt(perPage.toString()),
      filter
    );

    successResponse(res, "Get user list success", userList);
  } catch (error) {
    if (error instanceof Error) {
      errorResponse(res, error.message);
    } else {
      // Handle unexpected errors that are not instances of Error
      errorResponse(res, "An unexpected error occurred.");
    }
  }
};
