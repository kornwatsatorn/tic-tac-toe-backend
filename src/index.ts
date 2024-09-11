import express from "express";
import mongoose from "mongoose";
import routes from "./routes";
import appConfig from "./config/app";
import { successResponse } from "./utils/responseHandler";
import { notFoundHandler } from "./middlewares/notFoundMiddleware";

const app = express();
console.log(
  "%csrc/index.ts:9 appConfig.dbUrl",
  "color: #007acc;",
  appConfig.dbUrl
);
// Connect to MongoDB
mongoose
  .connect(appConfig.dbUrl, {
    serverSelectionTimeoutMS: 60000 // Increase the timeout to 60 seconds
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

// Middleware
app.use(express.json());
app.use("/api", routes);

// Health Check Endpoint
app.get("/health", (req, res) => successResponse(res, "Server is healthy"));

app.use(notFoundHandler);

app.listen(appConfig.port, () => {
  console.log(`Server is running on http://localhost:${appConfig.port}`);
});
