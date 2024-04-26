import type { Logger } from "pino";
import { responseSizeHistogram } from "../../metrics/metrics";

export const RouteHandler =
  (logger: Logger) =>
  ({ data, status }: { data?: any; status: number }) => {
    const stringifiedData = data !== undefined ? JSON.stringify(data) : data;
    responseSizeHistogram.observe(stringifiedData?.length || 0);
    logger.debug({ status, response: data });
    return new Response(stringifiedData, {
      status: status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  };
