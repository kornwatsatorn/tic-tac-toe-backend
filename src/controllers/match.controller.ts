import type { Request, Response } from "express";
import {
  findMatch,
  playing,
  initToGetMatch,
  leaveMatch,
  getMatchList
} from "@/services/match.service";
import { errorResponse, successResponse } from "@/utils/responseHandler";
import { EMatchType } from "@/enum/match.enum";
import { EQueueStatus } from "@/enum/queue.enum";
import type { FilterQuery } from "mongoose";
import type { IMatch } from "@/types/match";

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

export const handleMatchList = async (req: Request, res: Response) => {
  try {
    const { status, type, playerId, page = 1, perPage = 10 } = req.query;
    // filter
    const filter: FilterQuery<IMatch> = {};

    if (
      status &&
      Object.values(EQueueStatus).includes(status as EQueueStatus)
    ) {
      filter.status = status;
    }
    if (
      type &&
      Object.values(EMatchType).includes(
        type.toString().toUpperCase() as EMatchType
      )
    ) {
      filter.type = type.toString().toUpperCase();
    }

    if (playerId) {
      filter.$or = [{ player1: playerId }, { player2: playerId }];
    }

    const matchList = await getMatchList(
      parseInt(page.toString()),
      parseInt(perPage.toString()),
      filter
    );

    successResponse(res, "Get match list success", matchList);
  } catch (error) {
    if (error instanceof Error) {
      errorResponse(res, error.message);
    } else {
      // Handle unexpected errors that are not instances of Error
      errorResponse(res, "An unexpected error occurred.");
    }
  }
};
