import { describe, expect, it } from "vitest";
import config from "./config";
import { redis } from "./redis";
import { logger } from "./logger";
import "./index";
import { Model } from "./model";

const apiBaseUrl = `http://localhost:${config.port}`;

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
      it.only("should set request", async () => {
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
        expect(await Model().get(`${request.sessionId}:requests`)).toEqual([
          request.data,
        ]);
        expect(await Model().get(`${request.sessionId}:requests`)).toEqual([]);
      });

      it("should return requests", async () => {
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
