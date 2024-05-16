-- DropIndex
DROP INDEX "Request_sessionId_createdAt_idx";

-- CreateIndex
CREATE INDEX "Request_sessionId_idx" ON "Request"("sessionId");
