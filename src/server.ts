import { Controller } from "./controller";
import { logger } from "./logger";
import { Model } from "./model";
import { Router } from "./router";
import { PrismaClient } from "./prisma";

export const Server = async ({
  port,
  dbClient,
}: {
  port: string;
  dbClient?: PrismaClient;
}) => {
  Bun.serve({
    port,
    fetch: Router({
      controller: Controller({
        model: Model(dbClient),
      }),
    }),
  });

  logger.debug(`Server running on: http://localhost:${port}`);
};
