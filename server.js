// server.js
import "dotenv/config";

import app from "./src/app.js";
import { MESSAGES } from "./src/constants/messages.js";
import connectDB from "./src/config/db.js";
import env from "./src/config/env.js";
import logger from "./src/config/logger.js";

const isVercel = Boolean(process.env.VERCEL);
let bootstrapPromise = null;

const startServer = async () => {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      logger.info(MESSAGES.ENVIRONMENT_LOADED);
      logger.info(MESSAGES.SERVER_STARTED);
      await connectDB();
    })();
  }

  await bootstrapPromise;

  if (!isVercel) {
    app.listen(env.PORT, () => {
      logger.info(`${MESSAGES.SERVER_RUNNING} on port ${env.PORT}`);
    });
  }
};

process.on("uncaughtException", (error) => {
  logger.error(`uncaughtException: ${error.message}`);
  logger.error(error.stack || "No stack trace available");

  if (!isVercel) {
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason) => {
  const errorMessage =
    reason instanceof Error ? reason.message : JSON.stringify(reason);
  const errorStack =
    reason instanceof Error ? reason.stack : "No stack trace available";

  logger.error(`unhandledRejection: ${errorMessage}`);
  logger.error(errorStack || "No stack trace available");

  if (!isVercel) {
    process.exit(1);
  }
});

if (!isVercel) {
  startServer().catch((error) => {
    logger.error(`Server startup failed: ${error.message}`);
    logger.error(error.stack || "No stack trace available");
    process.exit(1);
  });
} else {
  startServer().catch((error) => {
    logger.error(`Vercel bootstrap failed: ${error.message}`);
    logger.error(error.stack || "No stack trace available");
  });
}

export default app;