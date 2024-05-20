import config from "./config";
import { PrismaClient } from "./prisma";
import { readReplicas } from "@prisma/extension-read-replicas";

export type PrismaClientWithReadReplica = typeof prisma;
export const prisma = new PrismaClient().$extends(
  readReplicas({
    url: config.db.readReplicaUrls,
  })
);
