-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('REQUEST', 'RESPONSE', 'HANDSHAKE_REQUEST', 'HANDSHAKE_RESPONSE');

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" "RequestType" NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Request_sessionId_createdAt_idx" ON "Request"("sessionId", "createdAt" DESC);
