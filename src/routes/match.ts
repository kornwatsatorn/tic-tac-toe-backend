import express from "express";
import {
  handleJoinMatch,
  handlePlay,
  handleInit,
  handleLeaveMatch
} from "@/controllers/match.controller";

import { requireAccessToken } from "@/middlewares";

const router = express.Router();

router.get("/", requireAccessToken, handleJoinMatch);
router.get("/init", requireAccessToken, handleInit);
router.post("/play", requireAccessToken, handlePlay);
router.post("/leave", requireAccessToken, handleLeaveMatch);

export default router;
