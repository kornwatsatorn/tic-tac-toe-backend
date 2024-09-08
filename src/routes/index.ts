import express from "express";
import userRoutes from "@/routes/user";

const router = express.Router();

// Mount the user routes at /users
router.use("/users", userRoutes);

export default router;
