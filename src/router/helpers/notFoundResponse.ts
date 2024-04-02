export const notFoundResponse = new Response(
  JSON.stringify({
    error: "Not Found",
  }),
  {
    status: 404,
    headers: {
      "Content-Type": "application/json",
    },
  }
);
