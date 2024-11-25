import z from "zod";

const channelIdRegex = /^[0-9a-fA-F-]{32,64}$/;

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

export type SendSuccessResponseBody = z.infer<typeof SendSuccessResponseBody>;
export const SendSuccessResponseBody = z.object({
  method: z.literal("sendResponse"),
  sessionId: z.string(),
  publicKey: z.string(),
  data: z.string(),
});

export type SendErrorResponseBody = z.infer<typeof SendErrorResponseBody>;
export const SendErrorResponseBody = z.object({
  method: z.literal("sendResponse"),
  sessionId: z.string(),
  error: z.string(),
});

export type SendResponseBody = z.infer<typeof SendResponseBody>;
export const SendResponseBody = z.union([
  SendSuccessResponseBody,
  SendErrorResponseBody,
]);

export type GetResponsesBody = z.infer<typeof GetResponsesBody>;
export const GetResponsesBody = z.object({
  method: z.literal("getResponses"),
  sessionId: z.string(),
});

export type SendHandshakeRequestBody = z.infer<typeof SendHandshakeRequestBody>;
export const SendHandshakeRequestBody = z.object({
  method: z.literal("sendHandshakeRequest"),
  sessionId: z.string(),
  data: z.string(),
});

export type GetHandshakeRequestBody = z.infer<typeof GetHandshakeRequestBody>;
export const GetHandshakeRequestBody = z.object({
  method: z.literal("getHandshakeRequest"),
  sessionId: z.string(),
  data: z.string().optional(),
});

export type SendHandshakeResponseBody = z.infer<
  typeof SendHandshakeResponseBody
>;
export const SendHandshakeResponseBody = z.object({
  method: z.literal("sendHandshakeResponse"),
  sessionId: z.string(),
  data: z.string(),
});

export type GetHandshakeResponseBody = z.infer<typeof GetHandshakeResponseBody>;
export const GetHandshakeResponseBody = z.object({
  method: z.literal("getHandshakeResponse"),
  sessionId: z.string(),
  data: z.string().optional(),
});

export type ApiV1Requests = z.infer<typeof ApiV1Requests>;
export const ApiV1Requests = z.union([
  SendRequestBody,
  GetRequestsBody,
  SendResponseBody,
  GetResponsesBody,
  SendHandshakeRequestBody,
  GetHandshakeRequestBody,
  SendHandshakeResponseBody,
  GetHandshakeResponseBody,
]);

export type GetRequestBody = z.infer<typeof GetRequestBody>;
export const GetRequestBody = z.object({
  method: z.literal("get"),
  channelIds: z.array(z.string().regex(channelIdRegex)).max(100),
});

export type GetResponse = z.infer<typeof GetResponse>;
export const GetResponse = z.object({
  channelId: z.string().regex(channelIdRegex),
  data: z.array(z.string().max(102_400)),
})

export type SetRequestBody = z.infer<typeof SetRequestBody>;
export const SetRequestBody = z.object({
  method: z.literal("set"),
  channelId: z.string().regex(channelIdRegex),
  data: z.string().max(102_400),
});

export type ApiV2Request = z.infer<typeof ApiV2Request>;
export const ApiV2Request = z.union([GetRequestBody, SetRequestBody]);

export type ApiRequest = z.infer<typeof ApiRequest>;
export const ApiRequest = z.union([ApiV1Requests, ApiV2Request]);
