export const invalidRequest = new Response(
  JSON.stringify({
    error: "Invalid request",
  }),
  {
    status: 400,
    headers: {
      "Content-Type": "application/json",
    },
  }
);
