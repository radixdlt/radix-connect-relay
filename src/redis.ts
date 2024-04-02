import { createClient } from "redis";
import { logger } from "./logger";

export type Redis = ReturnType<typeof createClient>;
export const Redis = ({ url, password }: { url: string; password: string }) =>
  createClient({
    url,
    password,
  })
    .on("error", (err) => logger.error("Redis Client Error", err))
    .connect();
