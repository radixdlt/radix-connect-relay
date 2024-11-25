import { describe, expect, it, jest, beforeEach } from "bun:test";
import { Model } from "./model";
import { RedisServer } from "./test-helpers/inMemoryRedisServer";
import { Server } from "./server";
import { Redis } from "./redis";
import { Controller } from "./controller";
import { Router } from "./router";
import type {
  GetHandshakeRequestBody,
  GetHandshakeResponseBody,
  SendHandshakeRequestBody,
  SendHandshakeResponseBody,
} from "./schemas";
import { httpPost } from "./test-helpers/httpPost";

const apiBaseUrl = `http://localhost:3001`;

const inMemoryRedis = await RedisServer();

await Server({
  port: "3001",
  // logger,
  redis: { url: inMemoryRedis.url, password: "", clusterMode: "disabled" },
});

const redis = await Redis({
  url: inMemoryRedis.url,
  password: "",
  clusterMode: "disabled",
});

const model = Model({ redis });

const controller = Controller({ model });

const router = Router({ controller });

const generateRandomValue = (len = 8192) =>
  Buffer.from(crypto.getRandomValues(new Uint8Array(len))).toString("hex");

const createItem = (
  sessionId = generateSessionId(),
  data = generateRandomValue(256)
) => {
  return {
    sessionId,
    data,
  };
};

const createHandshakeRequest = (
  sessionId = generateSessionId(),
  data = generateRandomValue(32)
) => {
  return {
    sessionId,
    data,
  };
};

const generateSessionId = () => crypto.randomUUID();

describe("API", () => {
  describe("router", () => {
    it("should fail for invalid url", async () => {
      const result = await router(
        new Request("http://localhost:3001/random", { method: "POST" })
      );
      expect(result.status).toBe(404);
    });

    it("should fail for invalid method", async () => {
      const result = await router(
        new Request("http://localhost:3001/api/v1", { method: "GET" })
      );
      expect(result.status).toBe(404);
    });

    it("should fail for invalid body", async () => {
      const result = await router(
        new Request("http://localhost:3001/api/v1", {
          method: "POST",
          body: JSON.stringify({}),
        })
      );
      expect(result.status).toBe(400);
    });

    it("should fail for non-existent method", async () => {
      const result = await router(
        new Request("http://localhost:3001/api/v1", {
          method: "POST",
          body: JSON.stringify({
            method: "random",
          }),
        })
      );
      expect(result.status).toBe(400);
    });

    describe("routing", () => {
      let mockedControllerRouter: ReturnType<typeof Router>;
      let addRequest: jest.Mock;
      let addResponse: jest.Mock;
      let getRequests: jest.Mock;
      let getResponses: jest.Mock;
      beforeEach(() => {
        addRequest = jest.fn().mockResolvedValue({ status: 201 });
        addResponse = jest.fn().mockResolvedValue({ status: 201 });
        getRequests = jest.fn().mockResolvedValue({ data: [], status: 200 });
        getResponses = jest.fn().mockResolvedValue({ data: [], status: 200 });

        mockedControllerRouter = Router({
          controller: {
            addRequest,
            addResponse,
            getRequests,
            getResponses,
          } as any,
        });
      });

      it("should call addRequest", async () => {
        await mockedControllerRouter(
          new Request("http://localhost:3001/api/v1", {
            method: "POST",
            body: JSON.stringify({
              method: "sendRequest",
              sessionId: generateSessionId(),
              data: "",
            }),
          })
        );

        expect(addRequest).toHaveBeenCalledTimes(1);
      });

      it("should call addResponse", async () => {
        await mockedControllerRouter(
          new Request("http://localhost:3001/api/v1", {
            method: "POST",
            body: JSON.stringify({
              method: "sendResponse",
              sessionId: generateSessionId(),
              data: "",
              publicKey: "",
            }),
          })
        );

        expect(addResponse).toHaveBeenCalledTimes(1);
      });

      it("should call getResponses", async () => {
        await mockedControllerRouter(
          new Request("http://localhost:3001/api/v1", {
            method: "POST",
            body: JSON.stringify({
              method: "getResponses",
              sessionId: generateSessionId(),
            }),
          })
        );

        expect(getResponses).toHaveBeenCalledTimes(1);
      });

      it("should call getRequests", async () => {
        await mockedControllerRouter(
          new Request("http://localhost:3001/api/v1", {
            method: "POST",
            body: JSON.stringify({
              method: "getRequests",
              sessionId: generateSessionId(),
            }),
          })
        );

        expect(getRequests).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("/api/v1", () => {
    const url = `${apiBaseUrl}/api/v1`;
    describe("sendRequest", () => {
      it("should set request", async () => {
        const request = {
          method: "sendRequest",
          ...createItem(),
        };
        const response = await fetch(`${url}`, {
          method: "POST",
          body: JSON.stringify(request),
        }).then(async (res) => ({
          data: await res.json(),
          status: res.status,
        }));
        expect(response).toEqual({ status: 201, data: null });
        expect(await model.getItems(`${request.sessionId}:requests`)).toEqual([
          request.data,
        ]);
        expect(await model.getItems(`${request.sessionId}:requests`)).toEqual(
          []
        );
      });
      it("should return requests", async () => {
        const sessionId = generateSessionId();
        const randomData1 = generateRandomValue(4);
        const randomData2 = generateRandomValue(4);

        await fetch(`${url}`, {
          method: "POST",
          body: JSON.stringify({
            method: "sendRequest",
            ...createItem(sessionId, randomData1),
          }),
        });
        await fetch(`${url}`, {
          method: "POST",
          body: JSON.stringify({
            method: "sendRequest",
            ...createItem(sessionId, randomData2),
          }),
        });
        const response = await fetch(`${url}`, {
          method: "POST",
          body: JSON.stringify({ method: "getRequests", sessionId }),
        }).then(async (res) => ({
          data: await res.json(),
          status: res.status,
        }));
        expect(response).toEqual({
          data: [randomData1, randomData2],
          status: 200,
        });
      });
    });

    describe("sendResponse", () => {
      it("should get invalid request response", async () => {
        const request = {
          method: "sendResponse",
          ...createItem(),
        };
        const { json, status } = await fetch(`${url}`, {
          method: "POST",
          body: JSON.stringify(request),
        }).then(async (res) => ({
          json: await res.json(),
          status: res.status,
        }));
        expect(status).toEqual(400);
        expect(json).toEqual({ error: "Invalid request" });
      });
      it("should send response", async () => {
        const request = {
          method: "sendResponse",
          sessionId: generateSessionId(),
          publicKey: generateRandomValue(32),
          data: generateRandomValue(4),
        };
        const sendResponseResult = await fetch(`${url}`, {
          method: "POST",
          body: JSON.stringify(request),
        }).then(async (res) => ({
          json: await res.json(),
          status: res.status,
        }));
        expect(sendResponseResult.status).toEqual(201);

        const getResponsesResult = await fetch(`${url}`, {
          method: "POST",
          body: JSON.stringify({
            method: "getResponses",
            sessionId: request.sessionId,
          }),
        }).then(async (res) => ({
          data: await res.json(),
          status: res.status,
        }));

        expect(getResponsesResult.data).toEqual([
          {
            data: request.data,
            publicKey: request.publicKey,
            sessionId: request.sessionId,
          },
        ]);
      });
    });

    describe("handshake", () => {
      const sendHandshakeRequestBody = {
        method: "sendHandshakeRequest",
        ...createHandshakeRequest(),
      } satisfies SendHandshakeRequestBody;

      const getHandshakeRequestBody = {
        method: "getHandshakeRequest",
        sessionId: sendHandshakeRequestBody.sessionId,
      } satisfies GetHandshakeRequestBody;

      const sendHandshakeResponseBody = {
        method: "sendHandshakeResponse",
        ...createHandshakeRequest(),
      } satisfies SendHandshakeResponseBody;

      const getHandshakeResponseBody = {
        method: "getHandshakeResponse",
        sessionId: sendHandshakeResponseBody.sessionId,
      } satisfies GetHandshakeResponseBody;

      it("should handle handshake flow", async () => {
        expect(
          await controller.addHandshakeRequest(sendHandshakeRequestBody)
        ).toEqual({ status: 201 });

        expect(
          await controller.getHandshakeRequest(getHandshakeRequestBody)
        ).toEqual({
          status: 200,
          data: { publicKey: sendHandshakeRequestBody.data },
        });

        // Should return undefined after reading
        expect(
          await controller.getHandshakeRequest(getHandshakeRequestBody)
        ).toEqual({
          status: 200,
          data: { publicKey: undefined },
        });

        expect(
          await controller.addHandshakeResponse(sendHandshakeResponseBody)
        ).toEqual({ status: 201 });

        expect(
          await controller.getHandshakeResponse(getHandshakeResponseBody)
        ).toEqual({
          status: 200,
          data: { publicKey: sendHandshakeResponseBody.data },
        });

        // Should return undefined after reading
        expect(
          await controller.getHandshakeResponse(getHandshakeResponseBody)
        ).toEqual({
          status: 200,
          data: { publicKey: undefined },
        });
      });
    });
  });

  describe("/api/v2", () => {
    const url = `${apiBaseUrl}/api/v2`;
    const post = httpPost(url);
    it("should fail for invalid body", async () => {
      const response = await post({});

      expect(response.status).toEqual(400);
    });
    it("should set data", async () => {
      const request = {
        method: "set",
        channelId: generateSessionId(),
        data: generateRandomValue(4),
      };
      const response = await post(request).then(async (res) => ({
        data: await res.json(),
        status: res.status,
      }));
      expect(response).toEqual({ status: 201, data: null });
      expect(await model.getItems(request.channelId)).toEqual([request.data]);
    });

    it("should not set data if data is too large", async () => {
      const request = {
        method: "set",
        channelId: generateSessionId(),
        data: generateRandomValue(102_401),
      };
      const response = await post(request).then(async (res) => ({
        data: await res.json(),
        status: res.status,
      }));
      expect(response.status).toEqual(400);
    });

    it("should set data near to limit", async () => {
      const request = {
        method: "set",
        channelId: generateSessionId(),
        data: generateRandomValue(100_000),
      };
      const response = await post(request).then(async (res) => ({
        data: await res.json(),
        status: res.status,
      }));
      expect(response.status).toEqual(400);
    });

    it("should not return channel id if data is empty", async () => {
      const channelIds = [generateSessionId(), generateSessionId()];
      const randomData1 = generateRandomValue(4);
      await post({
        method: "set",
        channelId: channelIds[0],
        data: randomData1,
      });
      const response = await post({ method: "get", channelIds }).then(
        async (res) => ({
          data: await res.json(),
          status: res.status,
        })
      );
      expect(response).toEqual({
        data: [
          {
            channelId: channelIds[0],
            data: [randomData1],
          },
        ],
        status: 200,
      });
    });

    it("should return data", async () => {
      const channelIds = [generateSessionId(), generateSessionId()];
      const randomData1 = generateRandomValue(4);
      const randomData2 = generateRandomValue(4);
      const randomData3 = generateRandomValue(4);

      await Promise.all([
        post({
          method: "set",
          channelId: channelIds[0],
          data: randomData1,
        }),
        post({
          method: "set",
          channelId: channelIds[0],
          data: randomData3,
        }),
        post({
          method: "set",
          channelId: channelIds[1],
          data: randomData2,
        }),
      ]);

      const response = await post({ method: "get", channelIds }).then(
        async (res) => ({
          data: await res.json(),
          status: res.status,
        })
      );
      expect(response).toEqual({
        data: [
          { channelId: channelIds[0], data: [randomData1, randomData3] },
          { channelId: channelIds[1], data: [randomData2] },
        ],
        status: 200,
      });
    });

    it("should handle 25 channel ids with 100 items each", async () => {
      const channelIds = Array.from({ length: 25 }, () => generateSessionId());
      const randomData = channelIds.reduce((acc, channelId) => {
        acc[channelId] = {
          channelId,
          data: Array.from({ length: 100 }, () => generateRandomValue(50_000)),
        };
        return acc;
      }, {} as Record<string, { channelId: string; data: string[] }>);

      await Promise.all(
        Object.values(randomData).map(({ channelId, data }) =>
          Promise.all(
            data.map((singleDataPack) =>
              post({
                method: "set",
                channelId,
                data: singleDataPack,
              })
            )
          )
        )
      );

      const response: { data: any; status: number } = await post({
        method: "get",
        channelIds,
      }).then(async (res) => ({
        data: await res.json(),
        status: res.status,
      }));

      // As we're inserting data asynchronously they may end up in different order than we have inside randomData
      // Because of that I'm doing a bit more complex assertions here instead of simple equality check
      expect(response.status).toEqual(200);
      expect(response.data.length).toEqual(Object.keys(randomData).length);
      response.data.forEach(
        (channelData: { channelId: string; data: string[] }) => {
          expect(randomData[channelData.channelId]).toBeDefined();
          expect(channelData.data.length).toEqual(
            randomData[channelData.channelId].data.length
          );
          const responseSet = new Set(channelData.data);
          randomData[channelData.channelId].data.forEach((data) => {
            expect(responseSet.has(data)).toBeTruthy();
          });
        }
      );
    });
  });
});
