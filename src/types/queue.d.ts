import type { EQueueStatus } from "@/enum/queue.enum";
import type { Document, Types } from "mongoose";

export interface IQueue extends Document {
  _id: Types.ObjectId;
  player: Types.ObjectId;
  status: EQueueStatus;
  matchId: Types.ObjectId;
}
