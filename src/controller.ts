import { Model } from "./model";
import type {
  GetHandshakeRequestBody,
  GetHandshakeResponseBody,
  GetRequestsBody,
  GetResponsesBody,
  SendHandshakeRequestBody,
  SendHandshakeResponseBody,
  SendRequestBody,
  SendResponseBody,
} from "./schemas";

export type Controller = ReturnType<typeof Controller>;
export const Controller = ({ model }: { model: Model }) => {
  const addRequest = async ({ data, sessionId }: SendRequestBody) => {
    await model.setItem(sessionId, "REQUEST", data);
    return { status: 201 };
  };

  const getRequests = async ({ sessionId }: GetRequestsBody) => {
    const data = await model.getItems(sessionId, "REQUEST");
    return { data, status: 200 };
  };

  const addResponse = async ({ data, sessionId }: SendResponseBody) => {
    await model.setItem(sessionId, "RESPONSE", data);
    return { status: 201 };
  };

  const getResponses = async ({ sessionId }: GetResponsesBody) => {
    const data = await model.getItems(sessionId, "RESPONSE");
    return { data, status: 200 };
  };

  const addHandshakeRequest = async ({
    data,
    sessionId,
  }: SendHandshakeRequestBody) => {
    await model.setItem(sessionId, "HANDSHAKE_REQUEST", data);
    return { status: 201 };
  };

  const getHandshakeRequest = async ({
    sessionId,
  }: GetHandshakeRequestBody) => {
    const publicKey = await model
      .getItems(sessionId, "HANDSHAKE_REQUEST")
      .then((items) => items[0]);
    return { data: { publicKey }, status: 200 };
  };

  const addHandshakeResponse = async ({
    data,
    sessionId,
  }: SendHandshakeResponseBody) => {
    await model.setItem(sessionId, "HANDSHAKE_RESPONSE", data);
    return { status: 201 };
  };

  const getHandshakeResponse = async ({
    sessionId,
  }: GetHandshakeResponseBody) => {
    const publicKey = await model
      .getItems(sessionId, "HANDSHAKE_RESPONSE")
      .then((items) => items[0]);
    return { data: { publicKey }, status: 200 };
  };

  return {
    addRequest,
    getRequests,
    addResponse,
    getResponses,
    addHandshakeRequest,
    getHandshakeRequest,
    addHandshakeResponse,
    getHandshakeResponse,
  };
};
