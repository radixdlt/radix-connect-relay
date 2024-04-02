import { Model } from "./model";
import type {
  GetRequestsBody,
  GetResponsesBody,
  SendRequestBody,
  SendResponseBody,
} from "./schemas";

export type Controller = ReturnType<typeof Controller>;
export const Controller = ({ model }: { model: Model }) => {
  const addRequest = async ({ data, sessionId }: SendRequestBody) => {
    await model.add(`${sessionId}:requests`, data);
    return { method: "sendRequest", data: { ok: true }, status: 200 };
  };

  const getRequests = async ({ sessionId }: GetRequestsBody) => {
    const data = await model.get(`${sessionId}:requests`);
    return { method: "getRequests", data, status: 200 };
  };

  const addResponse = async ({ data, sessionId }: SendResponseBody) => {
    await model.add(`${sessionId}:responses`, data);
    return { method: "sendResponse", data: { ok: true }, status: 200 };
  };

  const getResponses = async ({ sessionId }: GetResponsesBody) => {
    const data = await model.get(`${sessionId}:responses`);
    return { method: "getResponses", data, status: 200 };
  };

  return { addRequest, getRequests, addResponse, getResponses };
};
