import { responseSizeHistogram } from "../../metrics/metrics";

export const routeHandler = ({
  data,
  status,
}: {
  data: any;
  status: number;
}) => {
  const stringifiedData = JSON.stringify(data || "");
  responseSizeHistogram.observe(stringifiedData.length);
  return new Response(stringifiedData, {
    status: status,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
