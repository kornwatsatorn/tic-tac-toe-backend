import bcrypt from "bcryptjs";
import User from "../models/user.model";
import type { IUser } from "../types/user";
import jwt from "jsonwebtoken";
import config from "../config/app";
import type { FilterQuery } from "mongoose";

export const registerUser = async (userData: IUser) => {
  try {
    const { email, password, type, displayName } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already in use");
    }
    const existingDisplayName = await User.findOne({ displayName });
    if (existingDisplayName) {
      throw new Error("Display name already in use");
    }

    // Create a new user
    const newUser = new User({
      email,
      type,
      displayName
    });

    // Hash password if type is 'email'
    if (type === "email" && password) {
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);
    }

    // Save user to the database
    await newUser.save();

    return getUserAccessToken(newUser);
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw the error if it's already an instance of Error
      throw error;
    } else {
      // If it's not an Error instance, create a new Error with the provided message
      throw new Error("An unexpected error occurred.");
    }
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
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw the error if it's already an instance of Error
      throw error;
    } else {
      // If it's not an Error instance, create a new Error with the provided message
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const refreshAccessToken = async (user: IUser | undefined) => {
  try {
    // Find the user by ID and refresh token
    const find = await User.findOne({
      _id: user?._id
    });

    if (!find) {
      throw new Error("Invalid refresh token");
    }
    // Generate new access token
    return getUserAccessToken(find);
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw the error if it's already an instance of Error
      throw error;
    } else {
      // If it's not an Error instance, create a new Error with the provided message
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const getProfile = async (user: IUser | undefined) => {
  try {
    const find = await User.findOne({
      _id: user?._id
    });

    if (!find) {
      throw new Error("User not found");
    }

    const { password, ...userWithoutPassword } = find.toObject();
    return userWithoutPassword;
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw the error if it's already an instance of Error
      throw error;
    } else {
      // If it's not an Error instance, create a new Error with the provided message
      throw new Error("An unexpected error occurred.");
    }
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
      _id: user?._id
    });

    if (!find) {
      throw new Error("User not found");
    }
    const _updateData: { displayName?: string; displayImage?: string } = {};
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
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw the error if it's already an instance of Error
      throw error;
    } else {
      // If it's not an Error instance, create a new Error with the provided message
      throw new Error("An unexpected error occurred.");
    }
  }
};

const getUserAccessToken = (userData: IUser) => {
  const { password, ...userWithoutPassword } = userData.toObject();

  const accessToken = jwt.sign(userWithoutPassword, config.secretKey, {
    expiresIn: config.expiresIn
  });

  const refreshToken = jwt.sign(userWithoutPassword, config.secretKeyRefresh, {
    expiresIn: config.expiresInRefresh
  });
  return { user: userWithoutPassword, accessToken, refreshToken };
};

// admin function
export const getUserList = async (
  page: number,
  perPage: number,
  filter: FilterQuery<IUser>,
  sort: any
) => {
  try {
    const _user = await User.aggregate([
      { $match: filter }, // Filter documents based on the criteria
      { $sort: sort }, // Specify sort criteria here if needed
      { $skip: (page - 1) * perPage }, // Skip documents for pagination
      { $limit: perPage }, // Limit documents per page
      {
        $project: {
          id: "$_id",
          email: "$email",
          name: "$displayName",
          point: "$point",
          stack: "$botWinStack",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt"
        }
      }
    ]);

    const total = await User.countDocuments(filter);
    return {
      data: _user,
      total,
      page,
      totalPage: Math.ceil(total / perPage)
    };
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw the error if it's already an instance of Error
      throw error;
    } else {
      // If it's not an Error instance, create a new Error with the provided message
      throw new Error("An unexpected error occurred.");
    }
  }
};
