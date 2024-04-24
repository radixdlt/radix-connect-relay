import { createClient, createCluster } from "redis";
import { logger } from "./logger";

export type Redis = ReturnType<typeof createClient | typeof createCluster>;
export const Redis = ({ url, password, isClusterMode }: { url: string; password: string, isClusterMode: string }) => {
  const client = isClusterMode == "yes"
    ? createCluster({rootNodes: [{url}]})
    : createClient({
        url,
        password,
      });

  client
    .on("error", (err) => logger.error("Redis Client Error", err))
    .connect();

  return client;
};
