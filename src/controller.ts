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
    return { status: 201 };
  };

  const getRequests = async ({ sessionId }: GetRequestsBody) => {
    const data = await model.get(`${sessionId}:requests`);
    return { data, status: 200 };
  };

  const addResponse = async ({ data, sessionId }: SendResponseBody) => {
    await model.add(`${sessionId}:responses`, data);
    return { status: 201 };
  };

  const getResponses = async ({ sessionId }: GetResponsesBody) => {
    const data = await model.get(`${sessionId}:responses`);
    return { data, status: 200 };
  };

  return { addRequest, getRequests, addResponse, getResponses };
};
