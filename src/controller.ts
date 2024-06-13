import { Model } from "./model";
import {
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
  const addRequest = async (body: SendRequestBody) => {
    const { sessionId, data } = body;

    await model.setItem(`${sessionId}:requests`, data);
    return { status: 201 };
  };

  const getRequests = async ({ sessionId }: GetRequestsBody) => {
    const data = await model.getItems(`${sessionId}:requests`);
    return { data, status: 200 };
  };

  const addResponse = async (body: SendResponseBody) => {
    const { sessionId, data, publicKey, error } = body as any;

    await model.setItem(
      `${sessionId}:responses`,
      JSON.stringify({ sessionId, data, publicKey, error })
    );
    return { status: 201 };
  };

  const getResponses = async ({ sessionId }: GetResponsesBody) => {
    const data = await model.getItems(`${sessionId}:responses`);
    return { data: data.map((d) => JSON.parse(d)), status: 200 };
  };

  const addHandshakeRequest = async ({
    data,
    sessionId,
  }: SendHandshakeRequestBody) => {
    await model.set(`${sessionId}:handshake:request`, data);
    return { status: 201 };
  };

  const getHandshakeRequest = async ({
    sessionId,
  }: GetHandshakeRequestBody) => {
    const publicKey = await model.get(`${sessionId}:handshake:request`);
    return { data: { publicKey }, status: 200 };
  };

  const addHandshakeResponse = async ({
    data,
    sessionId,
  }: SendHandshakeResponseBody) => {
    await model.set(`${sessionId}:handshake:response`, data);
    return { status: 201 };
  };

  const getHandshakeResponse = async ({
    sessionId,
  }: GetHandshakeResponseBody) => {
    const publicKey = await model.get(`${sessionId}:handshake:response`);
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
