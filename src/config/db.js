// src/config/db.js
import mongoose from "mongoose";

import { MESSAGES } from "../constants/messages.js";
import env from "./env.js";
import logger from "./logger.js";

let connectionPromise = globalThis.__mongoConnectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.MONGO_URI).then(() => {
      logger.info(MESSAGES.DATABASE_CONNECTED);
      return mongoose.connection;
    });

    globalThis.__mongoConnectionPromise = connectionPromise;
  }

  return connectionPromise;
};

export default connectDB;