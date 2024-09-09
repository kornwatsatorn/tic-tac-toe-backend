import type { Request, Response } from "express";
import { findMatch, playing } from "@/services/match.service";
import { errorResponse, successResponse } from "@/utils/responseHandler";

export const handleJoinMatch = async (req: Request, res: Response) => {
  try {
    const join = await findMatch(req.user);

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
    const join = await playing(req.user, req.body.matchId, req.body.slot);

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
