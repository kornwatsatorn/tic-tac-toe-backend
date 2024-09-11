import type { IUser } from "@/types/user";
import mongoose, { Schema } from "mongoose";

const userSchema: Schema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return this.type === "email";
      }
    },
    displayName: {
      type: String,
      unique: true,
      default: function () {
        return `TTC_${new Date().getTime()}`;
      }
    },
    displayImage: { type: String, default: null },
    point: { type: Number, default: 0 },
    botWinStack: { type: Number, default: 0 },
    type: { type: String, enum: ["email", "social"], required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
