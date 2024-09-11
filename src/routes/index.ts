import express from "express";
import userRoutes from "@/routes/user";
import matchRoutes from "@/routes/match";
import sseRoutes from "@/routes/sse";
import adminRoutes from "@/routes/admin";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/match", matchRoutes);
router.use("/sse", sseRoutes);
router.use("/admin", adminRoutes);

export default router;
