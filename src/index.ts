import config from "./config";
import { InternalServer } from "./metrics/internal-server";
import { Server } from "./server";

await Server(config);
await InternalServer(config);