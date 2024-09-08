// src/routes/auth.ts

import express from "express";
import {
  handelLogin,
  handleRefreshToken,
  handleRegister,
  handleGetProfile,
  handleUpdateProfile
} from "@/controllers/user.controller";

import { requireAccessToken, requireAccessTokenRefresh } from "@/middlewares";

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handelLogin);
router.post("/refresh-token", requireAccessTokenRefresh, handleRefreshToken);
router.get("/", requireAccessToken, handleGetProfile);
router.patch("/", requireAccessToken, handleUpdateProfile);

export default router;
