import express from "express";
import {
  handleJoinMatch,
  handlePlay,
  handleInit,
  handleLeaveMatch,
  handleMatchList
} from "@/controllers/match.controller";

import { requireAccessToken, requireAccessTokenAdmin } from "@/middlewares";

const router = express.Router();

router.get("/", requireAccessToken, handleJoinMatch);
router.get("/init", requireAccessToken, handleInit);
router.post("/play", requireAccessToken, handlePlay);
router.post("/leave", requireAccessToken, handleLeaveMatch);
router.get("/list", requireAccessTokenAdmin, handleMatchList);

export default router;
