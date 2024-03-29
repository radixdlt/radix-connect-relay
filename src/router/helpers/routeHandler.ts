export const routeHandler = ({ data, status }: { data: any; status: number }) =>
  new Response(JSON.stringify(data), {
    status: status,
    headers: {
      "Content-Type": "application/json",
    },
  });
