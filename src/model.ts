import config from "./config";
import {
  redisDeleteTime,
  redisGetKeyTime,
  redisSetTime,
} from "./metrics/metrics";
import type { Redis } from "./redis";

export type Model = ReturnType<typeof Model>;
export const Model = ({ redis }: { redis: Redis }) => {
  const add = async (key: string, value: string) => {
    const t0 = performance.now();
    await Promise.all([
      redis.sAdd(key, value),
      redis.expire(key, config.redis.TTL),
    ]);
    const t1 = performance.now();
    redisSetTime.set(t1 - t0);
  };

  const get = async (key: string) => {
    const t0 = performance.now();
    const value = await redis.sMembers(key);
    const t1 = performance.now();
    redisGetKeyTime.set(t1 - t0);
    if (value.length) {
      const t0 = performance.now();
      await redis.del(key);
      const t1 = performance.now();
      redisDeleteTime.set(t1 - t0);
    }
    return value;
  };

  return { add, get };
};
