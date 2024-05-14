import {
  redisDeleteTime,
  redisGetKeyTime,
  redisSetTime,
} from "./metrics/metrics";
import { PrismaClient, RequestType } from "./prisma";

export type Model = ReturnType<typeof Model>;
export const Model = (dbClient = new PrismaClient()) => {
  const setItem = async (
    sessionId: string,
    type: RequestType,
    data: string
  ) => {
    const t0 = performance.now();
    await dbClient.request.create({ data: { sessionId, data, type } });
    const t1 = performance.now();
    redisSetTime.observe(t1 - t0);
  };

  const getItems = async (sessionId: string, type: RequestType) => {
    const t0 = performance.now();

    const items = await dbClient.request
      .findMany({
        where: { sessionId, type },
        select: { data: true },
      })
      .then((items) => items.map((item) => item.data));

    const t1 = performance.now();
    redisGetKeyTime.observe(t1 - t0);
    if (items.length) {
      const t0 = performance.now();
      await dbClient.request.deleteMany({ where: { sessionId, type } });
      const t1 = performance.now();
      redisDeleteTime.observe(t1 - t0);
    }
    return items;
  };

  return { setItem, getItems };
};
