import config from "./config";
import { logger } from "./logger";
import { redis } from "./redis";

export type Model = ReturnType<typeof Model>;
export const Model = () => {
  const add = async (key: string, value: string) => {
    await Promise.all([
      redis.sAdd(key, value),
      redis.expire(key, config.redis.TTL),
    ]);
  };

  const get = async (key: string) => {
    const value = await redis.sMembers(key);
    if (value.length) await redis.del(key);
    return value;
  };

  return { add, get };
};
