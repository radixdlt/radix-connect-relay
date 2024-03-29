import { createClient } from "redis";
import { logger } from "./logger";
import config from "./config";

export const redis = await createClient({
  url: config.redis.url,
  password: process.env.REDIS_PASSWORD,
})
  .on("error", (err) => logger.error("Redis Client Error", err))
  .connect();
