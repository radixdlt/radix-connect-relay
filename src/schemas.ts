import z from "zod";

export type SendRequestBody = z.infer<typeof SendRequestBody>;
export const SendRequestBody = z.object({
  method: z.literal("sendRequest"),
  sessionId: z.string(),
  data: z.string(),
});

export type ApiV1Requests = z.infer<typeof ApiV1Requests>;
export const ApiV1Requests = z.discriminatedUnion("method", [SendRequestBody]);
