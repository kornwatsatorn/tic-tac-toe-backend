// src/services/user.service.ts

import bcrypt from "bcryptjs";
import User from "@/models/user.model";
import { IUser } from "@/types/user";
import jwt from "jsonwebtoken";
import config from "@/config/app";

export const registerUser = async (userData: IUser) => {
  try {
    const { email, password, type } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already in use");
    }

    // Create a new user
    const newUser = new User({
      email,
      type,
    });

    // Hash password if type is 'email'
    if (type === "email" && password) {
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);
    }

    // Save user to the database
    await newUser.save();

    return getUserAccessToken(newUser);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signInUser = async (email: string, password?: string) => {
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    // Check password for 'email' type
    if (user.type === "email") {
      const isMatch = await bcrypt.compare(password || "", user.password || "");
      if (!isMatch) {
        throw new Error("Invalid credentials");
      }
    }

    return getUserAccessToken(user);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const refreshAccessToken = async (user: IUser | undefined) => {
  try {
    // Find the user by ID and refresh token
    const find = await User.findOne({
      _id: user?._id,
    });

    if (!find) {
      throw new Error("Invalid refresh token");
    }
    // Generate new access token
    return getUserAccessToken(find);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getProfile = async (user: IUser | undefined) => {
  try {
    const find = await User.findOne({
      _id: user?._id,
    });

    if (!find) {
      throw new Error("User not found");
    }
    const { password: _, ...userWithoutPassword } = find.toObject();
    return userWithoutPassword;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
export const updateProfile = async (
  user: IUser | undefined,
  displayName: string | undefined,
  displayImage: string | undefined
) => {
  try {
    if (displayName === undefined && displayImage === undefined) {
      throw new Error("User not update data");
    }
    const find = await User.findOne({
      _id: user?._id,
    });

    if (!find) {
      throw new Error("User not found");
    }
    const _updateData: any = {};
    if (displayName !== undefined) {
      if (displayName.trim().length <= 0) {
        throw new Error("display name invalid");
      }
      _updateData.displayName = displayName;
    }
    if (displayImage !== undefined) {
      _updateData.displayImage = displayImage;
    }
    await find.updateOne(_updateData);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getUserAccessToken = (userData: IUser) => {
  // Return user without the password
  const { password: _, ...userWithoutPassword } = userData.toObject();

  const accessToken = jwt.sign(userWithoutPassword, config.secretKey, {
    expiresIn: config.expiresIn,
  });

  const refreshToken = jwt.sign(userWithoutPassword, config.secretKeyRefresh, {
    expiresIn: config.expiresInRefresh,
  });
  return { user: userWithoutPassword, accessToken, refreshToken };
};
