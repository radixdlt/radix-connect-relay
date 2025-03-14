# Radix Connect Relay

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)

To install dependencies:

```bash
bun install
```

To run:

```bash
docker compose -f docker-compose.yml up
bun run dev
```

## API v1

The Radix Connect Relay only supports the `POST /api/v1` endpoint. The server executes code based on the `method` key in the request body. Multiple requests and responses can be stored for a single `sessionId`. As a result, the `data` field in the response for `getRequests` and `getResponses` is an array of strings.

Once data is retrieved for a specific `sessionId` using the `getRequests` or `getResponse` endpoints, it is immediately removed from the Redis storage. Therefore, it is not possible to access the same data multiple times.

<table>
<tr>
  <td><strong>Name</strong></td>
  <td><strong>Request Body</strong></td>
  <td><strong>Response Status</strong></td>
  <td><strong>Response Body</strong></td>
</tr>
<tr>
  <td><strong>Send Request</strong></td>
  <td>

```typescript
{
  method: "sendRequest",
  sessionId: string,
  data: string
}
```

</td>
<td><strong>201</strong>
</td>
<td><i>empty</i></td>
</tr>
<tr>
  <td><strong>Get Requests</strong></td>
  <td>

```typescript
{
  method: "getRequests",
  sessionId: string
}
```

</td>
<td><strong>200</strong></td>
<td>

```typescript
string[]
```

</td>
</tr>
<tr>
  <td><strong>Send Response</strong></td>
  <td>

```typescript
{
  method: "sendResponse",
  sessionId: string,
  data: string
}
```

</td>
<td><strong>201</strong></td>
<td><i>empty</i></td>
</tr>
<tr>
  <td><strong>Get Responses</strong></td>
  <td>

```typescript
{
  method: "getResponses",
  sessionId: string
}
```

</td>
<td><strong>200</strong></td>
<td>

```typescript
string[]
```

</td>
</tr>
<tr>
  <td><strong>Send Handshake Request</strong></td>
  <td>

```typescript
{
  method: "sendHandshakeRequest",
  sessionId: string,
  data: string
}
```

</td>
<td><strong>201</strong>
</td>
<td><i>empty</i></td>
</tr>
<tr>
  <td><strong>Get Handshake Request</strong></td>
  <td>

```typescript
{
  method: "getHandshakeRequest",
  sessionId: string,
}
```

</td>
<td><strong>200</strong>
</td>
<td>

```typescript
{ publicKey?: string  }
```

</td>
</tr>
<tr>
  <td><strong>Send Handshake Response</strong></td>
  <td>

```typescript
{
  method: "sendHandshakeResponse",
  sessionId: string,
  data: string
}
```

</td>
<td><strong>201</strong>
</td>
<td><i>empty</i></td>
</tr>
<tr>
  <td><strong>Get Handshake Response</strong></td>
  <td>

```typescript
{
  method: "getHandshakeResponse",
  sessionId: string,
}
```

</td>
<td><strong>200</strong>
</td>
<td>

```typescript
{ publicKey?: string  }
```

</td>
</table>


## API V2

The Radix Connect Relay supports the `POST /api/v2` endpoint. The server executes code based on the `method` key in the request body. Multiple packs of stringified data can be stored for single `channelId`. As a result, response for method `get` is an array of objects, each one containing `channelId` and corresponding array of `data`

Once data is retrieved for a specific `channelId` it is immediately removed from the Redis storage. Therefore, it is not possible to access the same data multiple times. Maximum size of single chunk of data is 100kB. Data is removed from redis storage after TTL (currently set to 10 minutes). `channelId` is required to be a hexadecimal string (and hyphens) between `32` to `64` characters

<table>
<tr>
  <td><strong>Name</strong></td>
  <td><strong>Request Body</strong></td>
  <td><strong>Response Status</strong></td>
  <td><strong>Response Body</strong></td>
</tr>
<tr>
  <td><strong>Set Data</strong></td>
  <td>

```typescript
{
  method: "set",
  channelId: string,
  data: string
}
```

</td>
<td><strong>201</strong>
</td>
<td><i>empty</i></td>
</tr>
<tr>
  <td><strong>Get Data</strong></td>
  <td>

```typescript
{
  method: "get",
  channelIds: string[]
}
```

</td>
<td><strong>200</strong></td>
<td>

```typescript
{
  channelId: string;
  data: string[]
}[]
```

</td>
</tr>

</table>

### Error responses

<table>
<tr>
<td><strong>HTTP Code</strog></td>
<td><strong>Response</strong></td>
<td><strong>Description</strong></td>
</tr>
<tr>
<td><strong>400</strong></td>
<td>

```json
{ "error": "Invalid request" }
```

</td>
<td>

When request body is invalid or does not pass `zod` validation

</td>
</tr>
<tr>
<td><strong>404</strong></td>
<td>

```json
{ "error": "Not Found" }
```

</td>
<td>

When anything other than `POST /api/v1`, `POST /api/v2`, `GET /` or `GET /metrics` is requested

</td>
</tr>

</table>

## Internal Server

Used for health check and collecting metrics

<table>
<tr>
  <td><strong>Name</strong></td>
  <td><strong>Response</strong></td>
</tr>
<tr>
  <td>
  
  <strong>Health `GET /`</strong></td>
<td>

`OK`

</td>
</tr>
<tr>
  <td>
  
  <strong>Metrics `GET /metrics`</strong></td>
<td>

_Prometheus metrics_

</td>
</tr>
</table>

