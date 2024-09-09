import User from "@/models/user.model";
import type { IUser } from "@/types/user";
import Match from "@/models/match.model";
import Queue from "@/models/queue.model";
import { EQueueStatus } from "@/enum/queue.enum";
import { checkWin, getTurnInMatch } from "@/utils/match";
import type { IMatchReplay } from "@/types/match";
import { Types } from "mongoose";
import { notifyMatchUpdate } from "./sse.service";
import { ESseStatus } from "@/enum/match.enum";

export const findMatch = async (user: IUser | undefined) => {
  try {
    // check user
    if (!user) {
      throw new Error("not have user");
    }

    // check in queue
    const _inQueue = await Queue.findOne({
      player: user._id,
      status: { $ne: EQueueStatus.C }
    }).sort({ createdAt: -1 });

    // if player in queue
    if (_inQueue) {
      const _getMatch = await Match.findOne({
        status: _inQueue.status,
        $or: [{ player1: user._id }, { player2: user._id }]
      }).sort({
        created_at: -1
      });
      if (_getMatch) {
        const _currentTurn = getTurnInMatch(_getMatch);
        return { match: _getMatch, currentTurn: _currentTurn };
      } else {
        throw new Error("Get match error");
      }
    }

    // find match
    const _find = await Match.findOne({
      player2: null,
      player1: { $ne: user._id }
    }).sort({
      created_at: 1
    });

    // create queue
    const _joinQueue = new Queue({ player: user._id });

    // not find match
    if (!_find) {
      // create match
      const createMatch = new Match({ player1: user._id });
      await createMatch.save();

      // create queue
      _joinQueue.matchId = createMatch._id;
      await _joinQueue.save();
      const _currentTurn = getTurnInMatch(createMatch);
      // return match
      return { match: createMatch, currentTurn: _currentTurn };
    } else {
      // join match
      await _find.updateOne({ player2: user._id, status: EQueueStatus.P });

      // Fetch the updated match
      const updatedMatch = await Match.findById(_find._id);

      // update queue to playing [player1,player2]
      await Queue.findOneAndUpdate(
        { player: _find.player1, matchId: _find._id },
        { status: EQueueStatus.P }
      );
      _joinQueue.status = EQueueStatus.P;
      _joinQueue.matchId = _find._id;
      await _joinQueue.save();

      notifyMatchUpdate(_find._id.toString(), ESseStatus.START);
      const _currentTurn = getTurnInMatch(_find);
      // return match
      return { match: updatedMatch, currentTurn: _currentTurn };
    }
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw the error if it's already an instance of Error
      throw error;
    } else {
      // If it's not an Error instance, create a new Error with the provided message
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const playing = async (
  user: IUser | undefined,
  matchId: string,
  slot: number
) => {
  try {
    let sseStatus = ESseStatus.UPDATE;
    // check user
    if (!user) {
      throw new Error("not have user");
    }

    // get match
    const _match = await Match.findOne({
      _id: matchId,
      $or: [{ player1: user._id }, { player2: user._id }],
      status: EQueueStatus.P
    });

    if (!_match) {
      throw new Error("Match not found");
    }

    // check turn player
    const _currentTurn = getTurnInMatch(_match);
    if (
      _currentTurn === null ||
      !(_currentTurn instanceof Types.ObjectId) ||
      !_currentTurn.equals(user._id)
    ) {
      throw new Error("Wait other player");
    }

    // check slot
    const _valueInSlot = _match.replay.find((_replay) => _replay.slot === slot);
    if (_valueInSlot) {
      throw new Error("Slot not blank");
    }

    // Calculate remainingTime
    let remainingTime = 600000; // Default 10 minutes in milliseconds
    const lastReplayByPlayer = _match.replay
      .filter((_replay) => _replay.player === user._id)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0];

    if (lastReplayByPlayer) {
      const timeDiff =
        new Date().getTime() - lastReplayByPlayer.created_at.getTime();
      remainingTime = Math.max(600000 - timeDiff, 0); // Reduce from 10 minutes, cannot be negative
    }

    // Append the new move to the replay array
    const newReplay = {
      player: user._id,
      slot: slot,
      created_at: new Date(),
      remainingTime: remainingTime
    } as IMatchReplay;
    _match.replay.push(newReplay);

    const _isWin = checkWin(_match);
    const _fullSlot = _match.replay.length === 9;
    if (_isWin || _fullSlot) {
      _match.winner = _isWin ? user._id : null;
      _match.status = EQueueStatus.C;
      _match.point = _isWin ? 1 : 0;
      await Queue.findOneAndUpdate(
        { player: _match.player1, matchId: _match._id },
        { status: EQueueStatus.C }
      );
      await Queue.findOneAndUpdate(
        { player: _match.player2, matchId: _match._id },
        { status: EQueueStatus.C }
      );

      // update point
      if (_isWin) {
        if (_match.player1.equals(_match.winner)) {
          await User.findOneAndUpdate(
            { _id: _match.player1 },
            { $inc: { point: 1 } }
          );
          await User.findOneAndUpdate(
            { _id: _match.player2, point: { $gt: 0 } },
            { $inc: { point: -1 } }
          );
        } else {
          await User.findOneAndUpdate(
            { _id: _match.player1, point: { $gt: 0 } },
            { $inc: { point: -1 } }
          );
          await User.findOneAndUpdate(
            { _id: _match.player2 },
            { $inc: { point: 1 } }
          );
        }
      }

      sseStatus = ESseStatus.END;
    }
    // Save the match
    await _match.save();

    notifyMatchUpdate(matchId, sseStatus);
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw the error if it's already an instance of Error
      throw error;
    } else {
      // If it's not an Error instance, create a new Error with the provided message
      throw new Error("An unexpected error occurred.");
    }
  }
};
