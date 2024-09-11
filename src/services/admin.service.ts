import type { IAdmin } from "../types/admin.d";
import bcrypt from "bcryptjs";
import Admin from "../models/admin.model";
import jwt from "jsonwebtoken";
import config from "../config/app";

export const registerAdmin = async (adminData: IAdmin) => {
  try {
    const { username, password, displayName } = adminData;

    // Check if user already exists
    const existingUser = await Admin.findOne({ username });
    if (existingUser) {
      throw new Error("Email already in use");
    }
    const existingDisplayName = await Admin.findOne({ displayName });
    if (existingDisplayName) {
      throw new Error("Display name already in use");
    }

    // Create a new user
    const newAdmin = new Admin({
      username,
      displayName
    });

    // Hash password if type is 'username'
    const salt = await bcrypt.genSalt(10);
    newAdmin.password = await bcrypt.hash(password, salt);

    // Save user to the database
    await newAdmin.save();

    return getAdminAccessToken(newAdmin);
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

export const signInAdmin = async (username: string, password?: string) => {
  try {
    // Find the user by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      throw new Error("User not found");
    }

    // Check password for 'username' type
    const isMatch = await bcrypt.compare(password || "", admin.password || "");
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    return getAdminAccessToken(admin);
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

const getAdminAccessToken = (adminData: IAdmin) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...adminWithoutPassword } = adminData.toObject();

  const accessToken = jwt.sign(adminWithoutPassword, config.secretKeyAdmin, {
    expiresIn: config.expiresIn
  });

  return { user: adminWithoutPassword, accessToken };
};
