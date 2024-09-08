import { Request } from "express";
import { IUser } from "@/types/user";

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Add user property with IUser type
    }
  }
}
