import User from "../models/user.model";
import type { Request, Response } from "express";
import Match from "../models/match.model";
import { EQueueStatus } from "../enum/queue.enum";
import { getTurnInMatch } from "../utils/match";
import { ESseStatus } from "../enum/match.enum";
import { botId } from "../utils/bot";

// Store active SSE connections
const clients: Record<string, Response[]> = {};

// Function to create SSE channel for a specific match ID
export const createSSEChannel = async (req: Request, res: Response) => {
  const matchId = req.params.id;
  const user = req.user;
  if (!user) {
    res.json({
      success: false,
      message: "User not found"
    });
    return;
  }

  // Check if the user has permission to join the SSE channel for the match
  const _match = await Match.findOne({
    _id: matchId,
    status: { $ne: EQueueStatus.C },
    $or: [{ player1: user._id }, { player2: user._id }]
  }).sort({
    created_at: -1
  });

  if (!_match) {
    res.json({
      success: false,
      message: "No permission in match"
    });
    return;
  }

  // Determine the turn based on the replay array
  const currentTurn = getTurnInMatch(_match);

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Keep the connection open by periodically sending a comment
  res.write(": connected\n\n");

  // Store the connection
  if (!clients[matchId]) {
    clients[matchId] = [];
  }
  clients[matchId].push(res);

  // Send the initial match data with the current turn to the client
  res.write(`data: ${JSON.stringify({ match: _match, currentTurn })}\n\n`);

  // Clean up when the client disconnects
  req.on("close", () => {
    clients[matchId] = clients[matchId].filter((client) => client !== res);
  });
};

// Function to send a real-time event to all clients subscribed to a specific match ID
export const sendSSEEvent = (matchId: string, data: object) => {
  if (clients[matchId]) {
    clients[matchId].forEach((client) => {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }
};

// Function to notify all clients of a match update
export const notifyMatchUpdate = async (
  matchId: string,
  message: ESseStatus
) => {
  try {
    // Retrieve the match from the database
    const _match = await Match.findOne({ _id: matchId });

    if (!_match) {
      console.error(`Match with ID ${matchId} not found.`);
      return;
    }

    // Determine the current turn based on the replay array
    const currentTurn = getTurnInMatch(_match);

    // Prepare the event data in the same format as createSSEChannel
    const eventData = {
      match: _match,
      currentTurn,
      message,
      point: {},
      stack: null
    };

    if (message === ESseStatus.END) {
      const _player1 = await User.findOne({ _id: _match.player1 });
      const _player2 = !_match.player2.equals(botId)
        ? await User.findOne({ _id: _match.player2 })
        : null;
      eventData.point = {
        player1: _player1.point,
        player2: _player2 ? _player2.point : 0
      };
      if (_match.player2.equals(botId)) {
        eventData.stack = _player1.botWinStack ?? 0;
      }
    }

    // Send the SSE event to all subscribed clients
    sendSSEEvent(matchId, eventData);
  } catch (error) {
    console.error(`Error notifying match update: ${error}`);
  }
};
