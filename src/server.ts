import { Controller } from "./controller";
import { logger } from "./logger";
import { Model } from "./model";
import { Router } from "./router";
import { prisma, type PrismaClientWithReadReplica } from "./db";

export const Server = async ({
  port,
  dbClient,
}: {
  port: string;
  dbClient?: PrismaClientWithReadReplica;
}) => {
  Bun.serve({
    port,
    fetch: Router({
      controller: Controller({
        model: Model(dbClient ?? prisma),
      }),
    }),
  });

  logger.debug(`Server running on: http://localhost:${port}`);
};
