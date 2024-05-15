import { Controller } from "../src/controller";
import { Model } from "../src/model";

const model = Model();

const controller = Controller({ model });

const generateRandomValue = (len = 100_000) =>
  Buffer.from(crypto.getRandomValues(new Uint8Array(len))).toString("hex");

for (const n of new Array(1000).fill(null).map((_, n) => n)) {
  console.log(`Adding request ${n + 1} of 1000`);

  await controller.addRequest({
    data: generateRandomValue(),
    sessionId: crypto.randomUUID(),
    method: "sendRequest",
  });
}
