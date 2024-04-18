import z from "zod";

export type SendRequestBody = z.infer<typeof SendRequestBody>;
export const SendRequestBody = z.object({
  method: z.literal("sendRequest"),
  sessionId: z.string(),
  data: z.string(),
});

export type GetRequestsBody = z.infer<typeof GetRequestsBody>;
export const GetRequestsBody = z.object({
  method: z.literal("getRequests"),
  sessionId: z.string(),
});

export type SendResponseBody = z.infer<typeof SendResponseBody>;
export const SendResponseBody = z.object({
  method: z.literal("sendResponse"),
  sessionId: z.string(),
  data: z.string(),
});

export type GetResponsesBody = z.infer<typeof GetResponsesBody>;
export const GetResponsesBody = z.object({
  method: z.literal("getResponses"),
  sessionId: z.string(),
});

export type SendHandshakeRequestBody = z.infer<typeof SendHandshakeRequestBody>;
export const SendHandshakeRequestBody = z.object({
  method: z.literal("sendHandshakeRequest"),
  sessionId: z.string(),
  publicKey: z.string(),
});

export type GetHandshakeRequestBody = z.infer<typeof GetHandshakeRequestBody>;
export const GetHandshakeRequestBody = z.object({
  method: z.literal("getHandshakeRequest"),
  sessionId: z.string(),
  publicKey: z.string().optional(),
});

export type SendHandshakeResponseBody = z.infer<
  typeof SendHandshakeResponseBody
>;
export const SendHandshakeResponseBody = z.object({
  method: z.literal("sendHandshakeResponse"),
  sessionId: z.string(),
  publicKey: z.string(),
});

export type GetHandshakeResponseBody = z.infer<typeof GetHandshakeResponseBody>;
export const GetHandshakeResponseBody = z.object({
  method: z.literal("getHandshakeResponse"),
  sessionId: z.string(),
});

export type ApiV1Requests = z.infer<typeof ApiV1Requests>;
export const ApiV1Requests = z.discriminatedUnion("method", [
  SendRequestBody,
  GetRequestsBody,
  SendResponseBody,
  GetResponsesBody,
  SendHandshakeRequestBody,
  GetHandshakeRequestBody,
  SendHandshakeResponseBody,
  GetHandshakeResponseBody,
]);
