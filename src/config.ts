const FIVE_MINUTES_IN_SECONDS = 300;

export default {
  internalPort: process.env.INTERNAL_PORT!,
  port: process.env.PORT!,
  redis: {
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    clusterMode: process.env.REDIS_CLUSTER_MODE,
    password: process.env.REDIS_PASSWORD!,
    TTL: FIVE_MINUTES_IN_SECONDS,
  },
  db: {
    readReplicaUrls: process.env.DATABASE_URL!.split(","),
  },
};
