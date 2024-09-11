import type { Document } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  displayName?: string;
  displayImage?: string;
  point: number;
  botWinStack?: number;
  type: "email" | "social";
}

export interface IUserFind {
  _id: Types.ObjectId;
  point?: unknown;
}
