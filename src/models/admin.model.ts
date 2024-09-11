import type { IAdmin } from "@/types/admin";
import mongoose, { Schema } from "mongoose";

const adminSchema: Schema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      unique: true,
      validate: {
        validator: function (v) {
          return v.trim().length > 0; // Ensure it's not empty after trim
        },
        message: "Display name should not be blank after trimming whitespace."
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model<IAdmin>("Admin", adminSchema);
