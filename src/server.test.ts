import { describe, expect, it, jest, beforeEach } from "bun:test";
import { Model } from "./model";
import { RedisServer } from "./test-helpers/inMemoryRedisServer";
import { Server } from "./server";
import { Redis } from "./redis";
import { Controller } from "./controller";
import { Router } from "./router";

const apiBaseUrl = `http://localhost:3001`;

const inMemoryRedis = await RedisServer();

await Server({
  port: "3001",
  redis: { url: inMemoryRedis.url, password: "" },
});

const redis = await Redis({ url: inMemoryRedis.url, password: "" });

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
        addRequest = jest.fn().mockResolvedValue({ ok: true });
        addResponse = jest.fn().mockResolvedValue({ ok: true });
        getRequests = jest.fn().mockResolvedValue({ data: [] });
        getResponses = jest.fn().mockResolvedValue({ data: [] });

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
        expect(response).toEqual({ status: 200, data: { ok: true } });
        expect(await model.get(`${request.sessionId}:requests`)).toEqual([
          request.data,
        ]);
        expect(await model.get(`${request.sessionId}:requests`)).toEqual([]);
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
      it("should set response", async () => {
        const request = {
          method: "sendResponse",
          ...createItem(),
        };
        const response = await fetch(`${url}`, {
          method: "POST",
          body: JSON.stringify(request),
        }).then(async (res) => ({
          data: await res.json(),
          status: res.status,
        }));
        expect(response).toEqual({ status: 200, data: { ok: true } });
        expect(await model.get(`${request.sessionId}:responses`)).toEqual([
          request.data,
        ]);
        expect(await model.get(`${request.sessionId}:responses`)).toEqual([]);
      });
    });

    describe("getResponses", () => {
      it("should get reponses", async () => {
        const sessionId = generateSessionId();
        const randomData1 = generateRandomValue(4);
        const randomData2 = generateRandomValue(4);

        await fetch(`${url}`, {
          method: "POST",
          body: JSON.stringify({
            method: "sendResponse",
            ...createItem(sessionId, randomData1),
          }),
        });
        await fetch(`${url}`, {
          method: "POST",
          body: JSON.stringify({
            method: "sendResponse",
            ...createItem(sessionId, randomData2),
          }),
        });
        const response = await fetch(`${url}`, {
          method: "POST",
          body: JSON.stringify({ method: "getResponses", sessionId }),
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
  });
});
