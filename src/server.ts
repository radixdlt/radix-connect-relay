import { Controller } from "./controller";
import type { Logger } from "pino";
import { Model } from "./model";
import { Router } from "./router";
import { Redis } from "./redis";

export const Server = async ({
  redis,
  logger,
  port,
}: {
  port: string;
  logger?: Logger;
  redis: { url: string; password: string; clusterMode: string };
}) => {
  Bun.serve({
    port,
    fetch: Router({
      logger,
      controller: Controller({
        model: Model({ redis: await Redis(redis) }),
      }),
    }),
  });

  logger?.debug(`Server running on: http://localhost:${port}`);
};
