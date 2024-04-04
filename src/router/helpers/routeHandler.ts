import { responseSizeHistogram } from "../../metrics/metrics";

export const routeHandler = ({ data, status }: { data?: any; status: number }) => {
  const stringifiedData = data !== undefined ? JSON.stringify(data) : data;
  responseSizeHistogram.observe(stringifiedData?.length || 0);
  return new Response(stringifiedData, {
    status: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
    },
  });
};
