// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "@/types/user";
import config from "@/config/app";

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
    return res.status(401).json({
      success: false,
      message: "Access token is missing or invalid",
    });
  }

  // Verify token
  jwt.verify(token, config.secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired access token",
      });
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
    return res.status(401).json({
      success: false,
      message: "Access token is missing or invalid",
    });
  }

  // Verify token
  jwt.verify(token, config.secretKeyRefresh, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired access token",
      });
    }

    // Attach user info from token to request
    req.user = decoded as IUser; // Ensure the decoded token is of type IUser

    // Proceed to the next middleware or route handler
    next();
  });
};
