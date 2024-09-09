import express from "express";
import { handleJoinMatch, handlePlay } from "@/controllers/match.controller";

import { requireAccessToken } from "@/middlewares";

const router = express.Router();

router.get("/", requireAccessToken, handleJoinMatch);
router.post("/play", requireAccessToken, handlePlay);

export default router;
