import { Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  displayName?: string;
  displayImage?: string;
  point: number;
  type: "email" | "social";
}
