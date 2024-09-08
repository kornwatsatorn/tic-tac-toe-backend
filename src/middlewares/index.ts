// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "@/types/user";
import config from "@/config/app";
import { errorResponse } from "@/utils/responseHandler";

// Middleware to verify access token
export const requireAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get token from headers
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from 'Bearer <token>'

  if (!token) {
    errorResponse(res, "Access token is missing or invalid", 401);
    return;
  }

  // Verify token
  jwt.verify(token, config.secretKey, (err, decoded) => {
    if (err) {
      errorResponse(res, "Invalid or expired access token", 403);
      return;
    }

    // Attach user info from token to request
    req.user = decoded as IUser; // Ensure the decoded token is of type IUser

    // Proceed to the next middleware or route handler
    next();
  });
};
export const requireAccessTokenRefresh = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get token from headers
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from 'Bearer <token>'

  if (!token) {
    errorResponse(res, "Access token is missing or invalid", 401);
    return;
  }

  // Verify token
  jwt.verify(token, config.secretKeyRefresh, (err, decoded) => {
    if (err) {
      errorResponse(res, "Invalid or expired access token", 403);
      return;
    }

    // Attach user info from token to request
    req.user = decoded as IUser; // Ensure the decoded token is of type IUser

    // Proceed to the next middleware or route handler
    next();
  });
};
