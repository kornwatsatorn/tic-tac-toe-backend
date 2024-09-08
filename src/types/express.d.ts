import type { IUser } from "@/types/user";

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Add user property with IUser type
    }
  }
}
