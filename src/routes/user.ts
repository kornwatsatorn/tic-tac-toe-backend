import express from "express";
import {
  handelLogin,
  handleRefreshToken,
  handleRegister,
  handleGetProfile,
  handleUpdateProfile,
  handleUserList,
  handleLeaderBoard
} from "../controllers/user.controller";

import {
  requireAccessToken,
  requireAccessTokenAdmin,
  requireAccessTokenRefresh
} from "../middlewares";

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handelLogin);
router.post("/refresh-token", requireAccessTokenRefresh, handleRefreshToken);
router.get("/", requireAccessToken, handleGetProfile);
router.patch("/", requireAccessToken, handleUpdateProfile);
router.get("/list", requireAccessTokenAdmin, handleUserList);
router.get("/leader-board", handleLeaderBoard);

export default router;
