// src/models/userModel.ts

import { EMatchType } from "../enum/match.enum";
import { EQueueStatus } from "../enum/queue.enum";
import type { IMatch } from "../types/match";
import mongoose, { Schema } from "mongoose";
import { ReplaySchema } from "./matchReplay.model";

const matchSchema: Schema = new Schema<IMatch>(
  {
    player1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    player2: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    type: { type: String, enum: EMatchType, default: EMatchType.PLAYER },
    winner: { type: Schema.Types.ObjectId, default: null },
    point: { type: Number },
    status: {
      type: String,
      enum: EQueueStatus,
      default: EQueueStatus.W
    },
    replay: [ReplaySchema]
  },
  { timestamps: true }
);

export default mongoose.model<IMatch>("Match", matchSchema);
