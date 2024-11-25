import { Controller } from "./controller";
import { logger } from "./logger";
import { Model } from "./model";
import { Router } from "./router";
import { Redis } from "./redis";

export const Server = async ({
  redis,
  port,
}: {
  port: string;
  redis: { url: string; password: string; clusterMode: string };
}) => {
  Bun.serve({
    port,
    fetch: Router({
      controller: Controller({
        model: Model({ redis: await Redis(redis) }),
      }),
    }),
  });

  logger.debug(`Server running on: http://localhost:${port}`);
};
