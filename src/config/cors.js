import cors from "cors";

const allowOrigins = (process.env.ALLOW_ORIGINS || "")
    .split(",")
    .map((o) => o.trim());

const corsOptions = {
    origin: (origin, callback) => {
        // allow Postman / server-to-server requests
        if (!origin) return callback(null, true);

        if (allowOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("CORS policy: Origin not allowed"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],

    allowedHeaders: ["Content-Type", "Authorization"],

    optionsSuccessStatus: 200
};

export default cors(corsOptions);