import { logger } from "./logger";

export default {
  internalPort: process.env.INTERNAL_PORT!,
  port: process.env.PORT!,
  logger,
  redis: {
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    clusterMode: process.env.REDIS_CLUSTER_MODE!,
    password: process.env.REDIS_PASSWORD!,
    TTL: parseInt(process.env.REDIS_TTL || "30"),
  },
};
