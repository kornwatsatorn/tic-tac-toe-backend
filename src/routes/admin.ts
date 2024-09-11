import express from "express";
import { handelLogin, handleRegister } from "@/controllers/admin.controller";

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handelLogin);

export default router;
