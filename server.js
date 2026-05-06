import "dotenv/config";

import app from "./src/app.js";
import { MESSAGES } from "./src/constants/messages.js";
import connectDB from "./src/config/db.js";
import env from "./src/config/env.js";
import logger from "./src/config/logger.js";

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    logger.info(`${MESSAGES.SERVER_RUNNING} on port ${env.PORT}`);
  });
};

startServer();
