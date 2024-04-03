import { logger } from "../logger";
import { notFoundResponse } from "../router/helpers/notFoundResponse";
import client from "prom-client";

export const InternalServer = async ({
  internalPort,
}: {
  internalPort: string;
}) => {
  Bun.serve({
    port: internalPort,
    fetch: async (req: Request): Promise<Response> => {
      const url = new URL(req.url);
      const path = url.pathname;

      if (path === "/") return new Response("OK", { status: 200 });
      if (path === "/metrics") {
        const metrics = await client.register.metrics();
        return new Response(metrics, { status: 200 });
      }

      return notFoundResponse;
    },
  });

  logger.debug(`Internal server running on: http://localhost:${internalPort}`);
};
