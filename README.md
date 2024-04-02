# Radix Connect Relay

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)

To install dependencies:

```bash
bun install
```

To run:

```bash
npm run dev
```


## API v1

Only endpoint for Radix Connect Relay is `POST /api/v1`. Server will execute code depending on `method` key inside request body. There can be multiple requests / responses stored for a single `sessionId`. Because of that `data` field for `getRequests` and `getResponses` response is array of strings.

<table>
<tr>
  <td><strong>Name</strong></td>
  <td><strong>Request Body</strong></td>
  <td><strong>Response</strong></td>
</tr>
<tr>
  <td><strong>Send Request</strong></td>
  <td>

```json
{
  "method": "sendRequest",
  "sessionId": "string",
  "data": "string"
}
```
</td>
<td>

```json
{
  "data": {
    "ok": true
  },
  "status": 200
}
```

</td>
</tr>
<tr>
  <td><strong>Get Requests</strong></td>
  <td>

```json
{
  "method": "getRequests",
  "sessionId": "string"
}
```
</td>
<td>

```json
{
  "data": ["string", "string"],
  "status": 200
}
```

</td>
</tr>
<tr>
  <td><strong>Send Response</strong></td>
  <td>

```json
{
  "method": "sendResponse",
  "sessionId": "string",
  "data": "string"
}
```
</td>
<td>

```json
{
  "data": {
    "ok": true
  },
  "status": 200
}
```

</td>
</tr>
<tr>
  <td><strong>Get Responses</strong></td>
  <td>

```json
{
  "method": "getResponses",
  "sessionId": "string"
}
```
</td>
<td>

```json
{
  "data": ["string", "string"],
  "status": 200
}
```

</td>
</tr>
</table>

