import type { IMatch } from "@/types/match";
import type { Types } from "mongoose";

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

export const checkWin = (_match: IMatch) => {
  // Define winning combinations for a 3x3 Tic Tac Toe grid
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

  const lastReplay = _match.replay[_match.replay.length - 1];
  const playerData: number[] = _match.replay
    .filter((e) => e.player.equals(lastReplay.player))
    .map((e) => e.slot);

  const isPlayer1Winner = winningCombinations.some((combination) =>
    combination.every((slot) => playerData.includes(slot))
  );

  return isPlayer1Winner;
};
