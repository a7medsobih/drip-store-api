// src/config/env.js
import normalizeMongoUri from "./mongo-uri.js";

const requiredEnvVars = ["MONGO_URI"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const mongoDbName = process.env.MONGO_DB_NAME || process.env.DB_NAME || "";

const env = {
  PORT: Number(process.env.PORT ?? 3000),
  MONGO_DB_NAME: mongoDbName,
  MONGO_URI: normalizeMongoUri(process.env.MONGO_URI, mongoDbName)
};

if (Number.isNaN(env.PORT)) {
  throw new Error("Environment variable PORT must be a valid number");
}

export default env;
