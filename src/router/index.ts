import type { Controller } from "../controller";
import { logger } from "../logger";
import { invalidRequest } from "./helpers/invalidRequest";
import { notFoundResponse } from "./helpers/notFoundResponse";
import { routeHandler } from "./helpers/routeHandler";
import { ApiV1Requests } from "../schemas";
import { getRequestBody } from "./helpers/getJson";
import {
  addHandshakeRequestCounter,
  addHandshakeResponseCounter,
  addRequestCounter,
  addResponseCounter,
  getHandshakeRequestCounter,
  getHandshakeResponseCounter,
  getRequestsCounter,
  getResponsesCounter,
  requestSizeHistogram,
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

    requestSizeHistogram.observe(JSON.stringify(rawRequestBody).length);

    if (rawRequestBody.error) return invalidRequest;

    const parsedRequestBody = await ApiV1Requests.safeParseAsync(
      rawRequestBody.data
    );
    if (!parsedRequestBody.success) return invalidRequest;

    const { data } = parsedRequestBody;

    logger.debug({
      path: url.pathname,
      httpMethod: req.method,
      data,
    });

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
      case "sendHandshakeRequest":
        addHandshakeRequestCounter.inc();
        return routeHandler(await controller.addHandshakeRequest(data));
      case "getHandshakeRequest":
        getHandshakeRequestCounter.inc();
        return routeHandler(await controller.getHandshakeRequest(data));
      case "sendHandshakeResponse":
        addHandshakeResponseCounter.inc();
        return routeHandler(await controller.addHandshakeResponse(data));
      case "getHandshakeResponse":
        getHandshakeResponseCounter.inc();
        return routeHandler(await controller.getHandshakeResponse(data));
    }

    return notFoundResponse;
  };
