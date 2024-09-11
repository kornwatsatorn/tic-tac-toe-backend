import express from "express";
import { handleJoinSse } from "../controllers/sse.controller";
import { requireAccessToken } from "../middlewares";

const router = express.Router();

// Define SSE route for match updates
router.get("/events/:id", requireAccessToken, handleJoinSse);

export default router;
