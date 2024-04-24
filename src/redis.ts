import { createClient, createCluster } from "redis";
import { logger } from "./logger";

export type Redis = ReturnType<typeof createClient | typeof createCluster>;
export const Redis = ({ url, password, clusterMode }: { url: string; password: string, clusterMode: string }) => {
  const client = clusterMode == "enabled"
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
