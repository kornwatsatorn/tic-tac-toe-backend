import type { Request, Response } from "express";
import { createSSEChannel } from "../services/sse.service";

// Controller function to handle joining SSE for a specific match
export const handleJoinSse = async (req: Request, res: Response) => {
  try {
    // Call the service function to create an SSE channel
    await createSSEChannel(req, res);
  } catch (error) {
    console.error(`Error handling SSE join request: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
