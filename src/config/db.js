import mongoose from "mongoose";

import { MESSAGES } from "../constants/messages.js";
import env from "./env.js";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info(MESSAGES.DATABASE_CONNECTED);
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
