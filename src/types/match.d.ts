import type { EQueueStatus } from "@/enum/queue.enum";
import type { Document, Types } from "mongoose";

export interface IMatch extends Document {
  _id: Types.ObjectId;
  type: EMatchType;
  player1: Types.ObjectId;
  player2: Types.ObjectId;
  winner?: Types.ObjectId | null;
  point?: number;
  status: EQueueStatus;
  replay: IMatchReplay[];
  result: number[];
}

export interface IMatchReplay extends Document {
  _id: Types.ObjectId;
  player: Types.ObjectId;
  slot: number;
  created_at: Date;
  remainingTime: number;
}
