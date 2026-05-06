const requiredEnvVars = ["PORT", "MONGO_URI"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const env = {
  PORT: Number(process.env.PORT),
  MONGO_URI: process.env.MONGO_URI
};

if (Number.isNaN(env.PORT)) {
  throw new Error("Environment variable PORT must be a valid number");
}

export default env;
