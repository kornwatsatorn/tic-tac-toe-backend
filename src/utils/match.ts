import type { ObjectId } from "mongodb";
import type { IMatch, IMatchReplay } from "../types/match";
import { type Types } from "mongoose";
import { botId } from "./bot";
import MatchReplay from "../models/matchReplay.model";
import Match from "../models/match.model";

export const getTurnInMatch = (_match: IMatch): Types.ObjectId => {
  let currentTurn;
  if (_match.replay.length === 0) {
    currentTurn = _match.player1; // If replay is empty, it's player1's turn
  } else {
    const lastReplay = _match.replay[_match.replay.length - 1];

    if (lastReplay.player === null) {
      currentTurn = _match.player1;
    } else {
      currentTurn = _match.player1.equals(lastReplay.player)
        ? _match.player2
        : _match.player1;
    }
  }
  return currentTurn;
};
const winningCombinations = [
  [1, 2, 3], // Row 1
  [4, 5, 6], // Row 2
  [7, 8, 9], // Row 3
  [1, 4, 7], // Column 1
  [2, 5, 8], // Column 2
  [3, 6, 9], // Column 3
  [1, 5, 9], // Diagonal top-left to bottom-right
  [3, 5, 7] // Diagonal top-right to bottom-left
];

export const checkWin = (_match: IMatch) => {
  // Define winning combinations for a 3x3 Tic Tac Toe grid

  const lastReplay = _match.replay[_match.replay.length - 1];
  const playerData: number[] = _match.replay
    .filter((e) => e.player.equals(lastReplay.player))
    .map((e) => e.slot);

  const isPlayer1Winner = winningCombinations.some((combination) =>
    combination.every((slot) => playerData.includes(slot))
  );

  return isPlayer1Winner;
};

export const botTurn = (_match: IMatch) => {
  const _replay = _match.replay;

  // 1. Check for winning move
  for (let i = 1; i <= 9; i++) {
    if (checkSlotBlank(_replay, i)) {
      const newReplay: IMatchReplay[] = [..._replay, createNewReplay(i)];
      const newMatch = new Match({ ..._match, replay: newReplay });
      if (checkWin(newMatch)) {
        return i;
      }
    }
  }

  // 2. Block opponent's winning move
  for (let i = 1; i <= 9; i++) {
    if (checkSlotBlank(_replay, i)) {
      // const newReplay = [..._replay, { player: "opponent", slot: i }];
      const newReplay: IMatchReplay[] = [
        ..._replay,
        createNewReplay(i, _match.player1)
      ];
      const newMatch = new Match({ ..._match, replay: newReplay });
      if (checkWin(newMatch)) {
        return i;
      }
    }
  }

  // 3. Check for potential forks or block opponent's forks
  const botMoves = _replay
    .filter((e) => e.player.equals(botId))
    .map((e) => e.slot);
  const opponentMoves = _replay
    .filter((e) => e.player.equals(_match.player1))
    .map((e) => e.slot);

  const emptySlots = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((i) =>
    checkSlotBlank(_replay, i)
  );

  // Fork logic for both bot and opponent
  const forkMoves = getForkMoves(emptySlots, botMoves);
  const opponentForkMoves = getForkMoves(emptySlots, opponentMoves);

  if (opponentForkMoves.length > 0) {
    return opponentForkMoves[0];
  }

  if (forkMoves.length > 0) {
    return forkMoves[0];
  }

  // 4. Take center if available
  if (checkSlotBlank(_replay, 5)) {
    return 5;
  }

  // 5. Take opposite corner if opponent is in a corner
  const corners = shuffleArray([1, 3, 7, 9]);
  const oppositeCorners = { 1: 9, 3: 7, 7: 3, 9: 1 };
  for (const corner of corners) {
    if (
      !checkSlotBlank(_replay, corner) &&
      checkSlotBlank(_replay, oppositeCorners[corner as 1 | 3 | 7 | 9])
    ) {
      return oppositeCorners[corner as 1 | 3 | 7 | 9];
    }
  }

  // 6. Take an empty corner
  for (const corner of corners) {
    if (checkSlotBlank(_replay, corner)) {
      return corner;
    }
  }

  // 7. Take an empty side
  const sides = [2, 4, 6, 8];
  for (const side of sides) {
    if (checkSlotBlank(_replay, side)) {
      return side;
    }
  }

  // Default case (should not reach here if the board is valid)
  return emptySlots[0];
};

// Helper function to check for forks
const getForkMoves = (
  emptySlots: number[],
  playerMoves: number[]
): number[] => {
  const forkMoves = [];
  for (const slot of emptySlots) {
    const newMoves = [...playerMoves, slot];
    const possibleWins = winningCombinations.filter(
      (combination) =>
        combination.filter((pos) => newMoves.includes(pos)).length === 2 &&
        combination.some((pos) => !newMoves.includes(pos))
    );
    if (possibleWins.length >= 2) {
      forkMoves.push(slot);
    }
  }
  return forkMoves;
};

export const checkSlotBlank = (
  replay: IMatchReplay[],
  slot: number
): boolean => {
  const _find = replay.find((e) => e.slot === slot);
  return _find ? false : true;
};

const createNewReplay = (
  slot: number,
  playerId: ObjectId = botId
): IMatchReplay => {
  const _replay: IMatchReplay = new MatchReplay({
    player: playerId,
    slot: slot,
    created_at: new Date(),
    remainingTime: 0
  });
  return _replay;
};

const shuffleArray = (array: any[]) => {
  return array.sort(() => Math.random() - 0.5);
};
