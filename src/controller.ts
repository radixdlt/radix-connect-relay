import { Model } from "./model";
import type { SendRequestBody } from "./schemas";

export type Controller = ReturnType<typeof Controller>;
export const Controller = (model = Model()) => {
  const addRequest = async ({ data, sessionId }: SendRequestBody) => {
    await model.add(`${sessionId}:requests`, data);
    return { data: { ok: true }, status: 200 };
  };

  return { addRequest };
};
