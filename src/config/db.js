// src/config/db.js
import mongoose from "mongoose";

import { MESSAGES } from "../constants/messages.js";
import env from "./env.js";
import logger from "./logger.js";

let connectionPromise = globalThis.__mongoConnectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    logger.info("MongoDB connection already established");
    return mongoose.connection;
  }

  if (!connectionPromise) {
    logger.info(MESSAGES.CONNECTING_TO_DATABASE);
    connectionPromise = mongoose
      .connect(env.MONGO_URI)
      .then(() => {
        logger.info(MESSAGES.DATABASE_CONNECTED);
        return mongoose.connection;
      })
      .catch((error) => {
        logger.error(`Database connection failed: ${error.message}`);

        if (error?.name === "MongooseServerSelectionError") {
          logger.error(
            "MongoDB Atlas did not accept the connection. Check Atlas Network Access, Vercel outbound access, and the MONGO_URI credentials."
          );
        }

        throw error;
      });

    globalThis.__mongoConnectionPromise = connectionPromise;
  }

  return connectionPromise;
};

export default connectDB;
