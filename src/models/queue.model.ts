import { EQueueStatus } from "../enum/queue.enum";
import type { IQueue } from "../types/queue";
import mongoose, { Schema } from "mongoose";

const queueSchema: Schema = new Schema<IQueue>(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: EQueueStatus,
      default: EQueueStatus.W
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true
    }
  },
  { timestamps: true }
);
queueSchema.pre("findOne", function () {
  this.populate("player", "email displayName displayImage point");
});

export default mongoose.model<IQueue>("Queue", queueSchema);
