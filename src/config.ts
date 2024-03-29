const FIVE_MINUTES_IN_SECONDS = 300;

export default {
  port: process.env.PORT,
  redis: {
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD,
    TTL: FIVE_MINUTES_IN_SECONDS,
  },
};
