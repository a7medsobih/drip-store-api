// server.js
import "dotenv/config";

import app from "./src/app.js";
import { MESSAGES } from "./src/constants/messages.js";
import connectDB from "./src/config/db.js";
import env from "./src/config/env.js";
import logger from "./src/config/logger.js";

const isVercel = Boolean(process.env.VERCEL);

const startServer = async () => {
  await connectDB();

  if (!isVercel) {
    app.listen(env.PORT, () => {
      logger.info(`${MESSAGES.SERVER_RUNNING} on port ${env.PORT}`);
    });
  }
};

try {
  await startServer();
} catch (error) {
  logger.error(`Server startup failed: ${error.message}`);

  if (!isVercel) {
    process.exit(1);
  }

  throw error;
}

export default app;