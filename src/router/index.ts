import type { Controller } from "../controller";
import type { Logger } from "pino";
import { invalidRequest } from "./helpers/invalidRequest";
import { notFoundResponse } from "./helpers/notFoundResponse";
import { RouteHandler } from "./helpers/routeHandler";
import { ApiV1Requests, ApiV2Request } from "../schemas";
import { getRequestBody } from "./helpers/getJson";
import {
  addHandshakeRequestCounter,
  addHandshakeResponseCounter,
  addRequestCounter,
  addResponseCounter,
  getDataCounter,
  getHandshakeRequestCounter,
  getHandshakeResponseCounter,
  getRequestsCounter,
  getResponsesCounter,
  requestSizeHistogram,
  setDataCounter,
} from "../metrics/metrics";

export const Router =
  ({ controller, logger }: { controller: Controller; logger?: Logger }) =>
  async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const path = url.pathname;

    const isAllowedMethod = req.method === "POST";
    const isAllowedPath = ["/api/v1", "/api/v2"].includes(path);

    if (!isAllowedMethod || !isAllowedPath) return notFoundResponse;

    const rawRequestBody = await getRequestBody(req);

    requestSizeHistogram.observe(JSON.stringify(rawRequestBody).length);

    if (rawRequestBody.error) return invalidRequest;

    const getRouteHandler = (data: { method: string }) => {
      logger?.debug({
        path,
        httpMethod: req.method,
      });

      return RouteHandler(
        logger?.child({ method: data.method, path: url.pathname })
      );
    };

    switch (path) {
      case "/api/v1":
        const parsedRequestBody = await ApiV1Requests.safeParseAsync(
          rawRequestBody.data
        );
        if (!parsedRequestBody.success) return invalidRequest;

        const { data } = parsedRequestBody;
        const routeHandler = getRouteHandler(data);

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

      case "/api/v2":
        const parsedV2RequestBody = await ApiV2Request.safeParseAsync(
          rawRequestBody.data
        );
        if (!parsedV2RequestBody.success) {
          return invalidRequest;
        }

        const dataV2 = parsedV2RequestBody.data;
        const routeV2Handler = getRouteHandler(dataV2);

        switch (dataV2.method) {
          case "set":
            setDataCounter.inc();
            return routeV2Handler(
              await controller.setData(dataV2.channelId, dataV2.data)
            );
          case "get":
            getDataCounter.inc();
            return routeV2Handler(await controller.getData(dataV2.channelIds));
        }
    }

    return notFoundResponse;
  };
