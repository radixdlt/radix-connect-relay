import client from "prom-client";

export const addRequestCounter = new client.Counter({
  name: "radix_connect_relay_add_request_count",
  help: "The number of added requests",
});

export const addResponseCounter = new client.Counter({
  name: "radix_connect_relay_add_response_count",
  help: "The number of added responses",
});

export const getResponsesCounter = new client.Counter({
  name: "radix_connect_relay_get_responses_count",
  help: "The number of requests to get relay responses",
});

export const getRequestsCounter = new client.Counter({
  name: "radix_connect_relay_get_requests_count",
  help: "The number of requests to get relay requests",
});

export const addHandshakeRequestCounter = new client.Counter({
  name: "radix_connect_relay_add_handshake_request_count",
  help: "The number of added handshake requests",
});

export const getHandshakeRequestCounter = new client.Counter({
  name: "radix_connect_relay_get_handshake_request_count",
  help: "The number of requests to get relay request",
});

export const addHandshakeResponseCounter = new client.Counter({
  name: "radix_connect_relay_add_handshake_response_count",
  help: "The number of added handshake responses",
});

export const getHandshakeResponseCounter = new client.Counter({
  name: "radix_connect_relay_get_handshake_response_count",
  help: "The number of responses to get relay response",
});

export const redisGetKeyTime = new client.Histogram({
  name: "radix_connect_relay_redis_get_time",
  help: "The time it takes in milliseconds for redis to get value",
  buckets: client.linearBuckets(1, 0.5, 20),
});

export const redisSetTime = new client.Histogram({
  name: "radix_connect_relay_redis_set_time",
  help: "The time it takes in milliseconds for redis to set value",
  buckets: client.linearBuckets(1, 0.5, 20),
});

export const redisDeleteTime = new client.Histogram({
  name: "radix_connect_relay_redis_delete_time",
  help: "The time it takes in milliseconds for redis to delete value",
  buckets: client.linearBuckets(1, 0.5, 20),
});

export const requestSizeHistogram = new client.Histogram({
  name: "radix_connect_relay_request_size_bytes",
  help: "The size of the requests in bytes",
  buckets: client.linearBuckets(20000, 20000, 50),
});

export const responseSizeHistogram = new client.Histogram({
  name: "radix_connect_relay_response_size_bytes",
  help: "The size of the response in bytes",
  buckets: client.linearBuckets(20000, 20000, 50),
});

client.collectDefaultMetrics();
