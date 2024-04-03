import client from "prom-client";

export const addRequestCounter = new client.Gauge({
  name: "radix_connect_relay_add_request_counter",
  help: "The number of added requests",
});

export const addResponseCounter = new client.Gauge({
  name: "radix_connect_relay_add_response_counter",
  help: "The number of added responses",
});

export const getResponsesCounter = new client.Gauge({
  name: "radix_connect_relay_get_responses_counter",
  help: "The number of requests to get relay responses",
});

export const getRequestsCounter = new client.Gauge({
  name: "radix_connect_relay_get_requests_counter",
  help: "The number of requests to get relay requests",
});

export const redisGetKeyTime = new client.Gauge({
  name: "radix_connect_relay_redis_get_time",
  help: "The time it takes in milliseconds for redis to get value",
});

export const redisSetTime = new client.Gauge({
  name: "radix_connect_relay_redis_set_time",
  help: "The time it takes in milliseconds for redis to set value",
});

export const redisDeleteTime = new client.Gauge({
  name: "radix_connect_relay_redis_delete_time",
  help: "The time it takes in milliseconds for redis to delete value",
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

// TODO: Uncomment when `prom-client` is not throwing errors
// client.collectDefaultMetrics();