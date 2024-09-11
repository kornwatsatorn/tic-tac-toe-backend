import type { IUser } from "@/types/user";
import type { IAdmin } from "./admin";

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Add user property with IUser type
      admin?: IAdmin; // Add user property with IUser type
    }
  }
}
