import express from "express";
import userRoutes from "./user";
import matchRoutes from "./match";
import sseRoutes from "./sse";
import adminRoutes from "./admin";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/match", matchRoutes);
router.use("/sse", sseRoutes);
router.use("/admin", adminRoutes);

export default router;
