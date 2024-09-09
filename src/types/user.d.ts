import type { Document } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  displayName?: string;
  displayImage?: string;
  point: number;
  type: "email" | "social";
}
