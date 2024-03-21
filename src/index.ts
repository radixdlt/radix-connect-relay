import { createClient } from "redis";
import Pino from "pino";

const logger = Pino({ level: "debug" });

const client = await createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
})
  .on("error", (err) => logger.error("Redis Client Error", err))
  .connect();

logger.debug("Redis Client Started!");

await client.set("foo", "bar");

await client.disconnect();

logger.debug(`Server running on port: ${process.env.PORT}`);

Bun.serve({
  port: process.env.PORT,
  fetch: async (req) => {
    const value = await client.get("key");
    return new Response(`got '${value}' from Redis`);
  },
});
