import config from "./config";
import { logger } from "./logger";
import Router from "./router";

export const server = () => {
  Bun.serve({
    port: config.port,
    fetch: Router(),
  });

  logger.debug(`Server running on: http://localhost:${process.env.PORT}`);
};

server();
