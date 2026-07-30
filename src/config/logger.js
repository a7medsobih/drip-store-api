// src/config/logger.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import winston from "winston";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDirectory = process.env.LOGS_DIR || path.resolve(__dirname, "../../logs");
const shouldWriteFiles = !process.env.VERCEL;

const transports = [new winston.transports.Console()];

try {
  if (shouldWriteFiles) {
    if (!fs.existsSync(logsDirectory)) {
      fs.mkdirSync(logsDirectory, { recursive: true });
    }

    transports.push(
      new winston.transports.File({
        filename: path.join(logsDirectory, "combined.log")
      })
    );
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDirectory, "error.log"),
        level: "error"
      })
    );
  }
} catch (error) {
  console.warn(
    `Logger: unable to create log directory (${logsDirectory}), falling back to console only.`,
    error
  );
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports
});

export default logger;