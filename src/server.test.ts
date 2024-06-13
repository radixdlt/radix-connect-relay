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

const apiBaseUrl = `http://localhost:3001`;

const inMemoryRedis = await RedisServer();

await Server({
  port: "3001",
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
});
