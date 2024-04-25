const baseUrl =
  "https://radix-connect-relay-dev.rdx-works-main.extratools.works/api/v1";

const generateRandomValue = (len = 8192) =>
  Buffer.from(crypto.getRandomValues(new Uint8Array(len))).toString("hex");

const generateSessionId = () => crypto.randomUUID();

const createItem = (
  sessionId = generateSessionId(),
  data = generateRandomValue(256)
) => {
  return {
    sessionId,
    data,
  };
};

const item = createItem();

await fetch(baseUrl, {
  method: "POST",
  body: JSON.stringify({
    method: "sendHandshakeRequest",
    ...item,
  }),
}).then((res) => {
  console.log(`sendHandshakeRequest ${res.ok ? "OK" : "NOT OK"}`);
});

console.log(``);

await fetch(baseUrl, {
  method: "POST",
  body: JSON.stringify({
    method: "getHandshakeRequest",
    sessionId: item.sessionId,
  }),
}).then((res) => {
  return res.text().then((text) => {
    console.log(`getHandshakeRequest ${res.ok ? "OK" : "NOT OK"}`);
    console.log(text);
  });
});

console.log(``);

await fetch(baseUrl, {
  method: "POST",
  body: JSON.stringify({
    method: "sendHandshakeResponse",
    ...item,
  }),
}).then((res) => {
  if (res.ok)
    console.log(`sendHandshakeResponseResponse ${res.ok ? "OK" : "NOT OK"}`);
});

console.log(``);

await fetch(baseUrl, {
  method: "POST",
  body: JSON.stringify({
    method: "getHandshakeResponse",
    sessionId: item.sessionId,
  }),
}).then((res) => {
  return res.text().then((text) => {
    console.log(`getHandshakeResponse ${res.ok ? "OK" : "NOT OK"}`);
    console.log(text);
  });
});

console.log(``);

await fetch(baseUrl, {
  method: "POST",
  body: JSON.stringify({
    method: "sendRequest",
    ...item,
  }),
}).then((res) => {
  console.log(`sendRequest ${res.ok ? "OK" : "NOT OK"}`);
});

console.log(``);

await fetch(baseUrl, {
  method: "POST",
  body: JSON.stringify({
    method: "getRequests",
    sessionId: item.sessionId,
  }),
}).then((res) => {
  return res.text().then((text) => {
    console.log(`getRequests ${res.ok ? "OK" : "NOT OK"}`);
    console.log(text);
  });
});

console.log(``);

await fetch(baseUrl, {
  method: "POST",
  body: JSON.stringify({
    method: "sendResponse",
    ...item,
  }),
}).then((res) => {
  console.log(`sendResponse ${res.ok ? "OK" : "NOT OK"}`);
});

console.log(``);

await fetch(baseUrl, {
  method: "POST",
  body: JSON.stringify({
    method: "getResponses",
    sessionId: item.sessionId,
  }),
}).then((res) => {
  return res.text().then((text) => {
    console.log(`getResponses ${res.ok ? "OK" : "NOT OK"}`);
    console.log(text);
  });
});
