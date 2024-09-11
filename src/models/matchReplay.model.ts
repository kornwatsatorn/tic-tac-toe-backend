import type { IMatchReplay } from "@/types/match";
import mongoose, { Schema } from "mongoose";

export const ReplaySchema = new Schema<IMatchReplay>({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    default: null
  },
  slot: { type: Number, required: true },
  created_at: { type: Date, default: new Date() },
  remainingTime: { type: Number, required: true }
});

export default mongoose.model<IMatchReplay>("MatchReplay", ReplaySchema);
