import { describe, expect, it } from "bun:test";
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

const createItem = (sessionId = generateSessionId()) => {
  return {
    sessionId,
    data: generateRandomValue(256),
  };
};

const generateSessionId = () => crypto.randomUUID();

describe("API", () => {
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
      it.skip("should return requests", async () => {
        const sessionId = generateSessionId();
        const data1 = {
          method: "sendRequest",
          ...createItem(sessionId),
        };
        const data2 = {
          method: "sendRequest",
          ...createItem(sessionId),
        };
        await fetch(`${url}`, {
          method: "POST",
          body: JSON.stringify(data1),
        });
        await fetch(`${url}`, {
          method: "POST",
          body: JSON.stringify(data2),
        });
        const response = await fetch(`${url}`, {
          method: "POST",
          body: JSON.stringify({ method: "getRequests" }),
        }).then(async (res) => ({
          data: await res.json(),
          status: res.status,
        }));
        expect(response).toBe({});
      });
    });
  });
  describe("error responses", () => {
    it("should return 404", async () => {
      const response = await fetch(apiBaseUrl, { method: "GET" });
      expect(response.status).toBe(404);
    });
  });
});
