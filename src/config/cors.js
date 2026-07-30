// src/config/cors.js
import cors from "cors";

const allowOrigins = [
  ...(process.env.ALLOW_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ...(process.env.VERCEL_BRANCH_URL ? [`https://${process.env.VERCEL_BRANCH_URL}`] : [])
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow Postman / server-to-server requests
    if (!origin) return callback(null, true);

    if (allowOrigins.length === 0 || allowOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],

  allowedHeaders: ["Content-Type", "Authorization"],

  optionsSuccessStatus: 200
};

export default cors(corsOptions);