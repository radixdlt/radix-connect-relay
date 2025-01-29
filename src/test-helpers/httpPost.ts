import type { GetResponse } from "../schemas";

export const httpPost = (url: string) => (body: any) => {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
  }).then((res) =>
    res.json().then((json) => ({ status: res.status, data: json }))
  );
};

export const v2Api = (apiBaseUrl: string) => {
  const url = `${apiBaseUrl}/api/v2`;
  const post = httpPost(url);
  return {
    post,
    set: (channelId: string, data: string) =>
      post({ method: "set", channelId, data }),
    get: (channelIds: string[]) =>
      post({ method: "get", channelIds }) as Promise<{
        status: number;
        data: GetResponse[];
      }>,
  };
};
