import dotenv from "dotenv";

dotenv.config();

const appConfig = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL || "",
  secretKey: process.env.JWT_SECRET || "my-secret-key",
  secretKeyRefresh: process.env.JWT_REFRESH_SECRET || "my-secret-key",
  expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  expiresInRefresh: process.env.JWT_REFRESH_EXPIRES_IN || "7h"
};

export default appConfig;
