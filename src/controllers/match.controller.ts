import type { Request, Response } from "express";
import {
  findMatch,
  playing,
  initToGetMatch,
  leaveMatch
} from "@/services/match.service";
import { errorResponse, successResponse } from "@/utils/responseHandler";
import { EMatchType } from "@/enum/match.enum";

export const handleJoinMatch = async (req: Request, res: Response) => {
  try {
    const matchType = (req.query.type as EMatchType) ?? EMatchType.BOT;
    const join = await findMatch(req.user, matchType);

    successResponse(res, "Join match success", join);
  } catch (error) {
    if (error instanceof Error) {
      errorResponse(res, error.message);
    } else {
      // Handle unexpected errors that are not instances of Error
      errorResponse(res, "An unexpected error occurred.");
    }
  }
};

export const handlePlay = async (req: Request, res: Response) => {
  try {
    const play = await playing(req.user, req.body.matchId, req.body.slot);

    successResponse(res, "Select slot success", play);
  } catch (error) {
    if (error instanceof Error) {
      errorResponse(res, error.message);
    } else {
      // Handle unexpected errors that are not instances of Error
      errorResponse(res, "An unexpected error occurred.");
    }
  }
};

export const handleInit = async (req: Request, res: Response) => {
  try {
    const check = await initToGetMatch(req.user);

    successResponse(res, "Check last match success", check);
  } catch (error) {
    if (error instanceof Error) {
      errorResponse(res, error.message);
    } else {
      // Handle unexpected errors that are not instances of Error
      errorResponse(res, "An unexpected error occurred.");
    }
  }
};
export const handleLeaveMatch = async (req: Request, res: Response) => {
  try {
    const leave = await leaveMatch(req.user, req.body.matchId);

    successResponse(res, "Leave match success", leave);
  } catch (error) {
    if (error instanceof Error) {
      errorResponse(res, error.message);
    } else {
      // Handle unexpected errors that are not instances of Error
      errorResponse(res, "An unexpected error occurred.");
    }
  }
};
