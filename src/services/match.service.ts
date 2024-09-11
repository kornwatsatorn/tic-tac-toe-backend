import User from "../models/user.model";
import type { IUser } from "../types/user";
import Match from "../models/match.model";
import Queue from "../models/queue.model";
import { EQueueStatus } from "../enum/queue.enum";
import { botTurn, checkWin, getTurnInMatch } from "../utils/match";
import type { IMatch, IMatchReplay } from "../types/match";
import { type FilterQuery, Types } from "mongoose";
import { notifyMatchUpdate } from "./sse.service";
import { EMatchType, ESseStatus } from "../enum/match.enum";
import { botId } from "../utils/bot";

export const findMatch = async (user: IUser | undefined, type: EMatchType) => {
  try {
    // check user
    if (!user) {
      throw new Error("not have user");
    }

    const checkMatch = await initToGetMatch(user);
    if (checkMatch.isMatch) {
      return { match: checkMatch.match, currentTurn: checkMatch.currentTurn };
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
    if (!_find || type === EMatchType.BOT) {
      // create match
      const createMatch = new Match({
        player1: user._id,
        type
      });

      if (type == EMatchType.BOT) {
        createMatch.player2 = botId;
        createMatch.status = EQueueStatus.P;
        _joinQueue.status = EQueueStatus.P;
      }
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

      await notifyMatchUpdate(_find._id.toString(), ESseStatus.START);
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
    let _match = await Match.findOne({
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

    const _checkWin = await checkWinAfterSelectSlot(_match, user);
    if (_checkWin.isWin) {
      _match = _checkWin.match;
      sseStatus = _checkWin.sseStatus;
    } else if (_match.type === EMatchType.BOT) {
      const _slotBot = botTurn(_match);
      if (_slotBot) {
        const newReplay = {
          player: botId,
          slot: _slotBot,
          created_at: new Date(),
          remainingTime: remainingTime
        } as IMatchReplay;
        _match.replay.push(newReplay);
      }
      const _userBot = new User({
        _id: botId,
        email: `bot_tic_tac_toe_${new Date().getTime()}@bot.bot`
      });
      const _checkWinBot = await checkWinAfterSelectSlot(_match, _userBot);
      if (_checkWinBot.isWin) {
        _match = _checkWinBot.match;
        sseStatus = _checkWinBot.sseStatus;
      }
    }
    await _match.save();
    await notifyMatchUpdate(matchId, sseStatus);
    if (_match.type === EMatchType.BOT) {
      await notifyMatchUpdate(matchId, ESseStatus.BOT);
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

export const initToGetMatch = async (user: IUser | undefined) => {
  try {
    // check user
    if (!user) {
      throw new Error("not have user");
    }

    // check in queue
    const _inQueue = await Queue.findOne({
      player: user._id,
      status: { $nin: [EQueueStatus.C, EQueueStatus.L] }
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
        return { isMatch: true, match: _getMatch, currentTurn: _currentTurn };
      } else {
        throw new Error("Get match error");
      }
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
  return { isMatch: false };
};

export const leaveMatch = async (user: IUser | undefined, matchId: string) => {
  try {
    // check user
    if (!user) {
      throw new Error("not have user");
    }

    // check in queue
    const _match = await Match.findOne({
      _id: matchId,
      $or: [{ player1: user._id }, { player2: user._id }],
      status: EQueueStatus.W
    });
    if (_match) {
      // update match
      _match.status = EQueueStatus.L;
      await _match.save();
      await Queue.findOneAndUpdate({ matchId }, { status: EQueueStatus.L });
      await notifyMatchUpdate(_match._id.toString(), ESseStatus.CANCEL);
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

const checkWinAfterSelectSlot = async (_match: IMatch, user: IUser) => {
  const _isWin = checkWin(_match);
  const _fullSlot = _match.replay.length === 9;
  if (_isWin || _fullSlot) {
    _match.winner = _isWin ? user._id : null;
    _match.status = EQueueStatus.C;
    _match.point = 0; // set default
    await Queue.findOneAndUpdate(
      { player: _match.player1, matchId: _match._id },
      { status: EQueueStatus.C }
    );
    if (!_match.player2.equals(botId)) {
      await Queue.findOneAndUpdate(
        { player: _match.player2, matchId: _match._id },
        { status: EQueueStatus.C }
      );
    }
    // check when bot mode

    const _findPlayer1: FilterQuery<IUser> = { _id: _match.player1 };
    const _findPlayer2: FilterQuery<IUser> = { _id: _match.player2 };
    const _player1 = await User.findOne({ _id: _match.player1 });

    let _player1Point = 1;
    let _player2Point = 1;
    // draw
    if (_match.winner === null) {
      _player1Point = 0;
      _player2Point = 0;
      if (_match.player2.equals(botId)) {
        _player1.botWinStack = 0;
      }
      _match.point = 0;
    } else if (_match.player1.equals(_match.winner)) {
      _player1Point = 1;
      _player2Point = -1;
      _findPlayer2.point = { $gt: 0 };
      if (_match.player2.equals(botId)) {
        if (_player1.botWinStack + 1 < 3) {
          _player1.botWinStack = _player1.botWinStack + 1;
        } else {
          _player1.botWinStack = 0;
          _player1Point = 2;
        }
      }
      _match.point = _player1Point;
    } else {
      _player1Point = -1;
      _player2Point = 1;
      _findPlayer1.point = { $gt: 0 };
      if (_match.player2.equals(botId)) {
        _player1.botWinStack = 0;
      } else {
        _match.point = _player2Point;
      }
    }
    await _player1.save();

    // update point
    await User.findOneAndUpdate(_findPlayer1, {
      $inc: { point: _player1Point }
    });
    if (_match.player2.equals(botId)) {
      await User.findOneAndUpdate(_findPlayer2, {
        $inc: { point: _player2Point }
      });
    }
  }
  return {
    isWin: _isWin || _fullSlot,
    match: _match,
    sseStatus: ESseStatus.END
  };
};

// admin function
export const getMatchList = async (
  page: number,
  perPage: number,
  filter: FilterQuery<IMatch>
) => {
  try {
    const _match = await Match.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const total = await Match.countDocuments(filter);
    return {
      data: _match,
      total,
      page,
      totalPage: Math.ceil(total / perPage)
    };
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
