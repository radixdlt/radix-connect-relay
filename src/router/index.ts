import type { Controller } from "../controller";
import { logger } from "../logger";
import { invalidRequest } from "./helpers/invalidRequest";
import { notFoundResponse } from "./helpers/notFoundResponse";
import { routeHandler } from "./helpers/routeHandler";
import { ApiV1Requests } from "../schemas";
import { getRequestBody } from "./helpers/getJson";
import {
  addRequestCounter,
  addResponseCounter,
  getRequestsCounter,
  getResponsesCounter,
} from "../metrics/metrics";

export const Router =
  ({ controller }: { controller: Controller }) =>
  async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const path = url.pathname;

    const isAllowedMethod = req.method === "POST";
    const isAllowedPath = ["/api/v1"].includes(path);

    if (!isAllowedMethod || !isAllowedPath) return notFoundResponse;

    const rawRequestBody = await getRequestBody(req);
    if (rawRequestBody.error) return invalidRequest;

    const parsedRequestBody = await ApiV1Requests.safeParseAsync(
      rawRequestBody.data
    );
    if (!parsedRequestBody.success) return invalidRequest;

    logger.debug({
      path: url.pathname,
      method: req.method,
    });

    const data = parsedRequestBody.data;

    switch (data.method) {
      case "sendRequest":
        addRequestCounter.inc();
        return routeHandler(await controller.addRequest(data));
      case "getRequests":
        getRequestsCounter.inc();
        return routeHandler(await controller.getRequests(data));
      case "sendResponse":
        addResponseCounter.inc();
        return routeHandler(await controller.addResponse(data));
      case "getResponses":
        getResponsesCounter.inc();
        return routeHandler(await controller.getResponses(data));
    }

    return notFoundResponse;
  };
