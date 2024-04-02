import Pino from "pino";

export type Logger = typeof Logger;
export const Logger = (
  level: Parameters<typeof Pino>["0"]["level"] = "debug"
) => Pino({ level });

export const logger = Logger("debug");
