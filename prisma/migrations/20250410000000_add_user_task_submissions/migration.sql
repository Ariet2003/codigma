-- CreateTable
CREATE TABLE "UserTaskSubmission" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "memory" BIGINT,
  "executionTime" BIGINT,
  "testsPassed" INTEGER NOT NULL DEFAULT 0,
  "testsTotal" INTEGER NOT NULL DEFAULT 0,
  "status" "Status" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserTaskSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTaskSubmission_userId_idx" ON "UserTaskSubmission"("userId");

-- CreateIndex
CREATE INDEX "UserTaskSubmission_taskId_idx" ON "UserTaskSubmission"("taskId");

-- AddForeignKey
ALTER TABLE "UserTaskSubmission" ADD CONSTRAINT "UserTaskSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTaskSubmission" ADD CONSTRAINT "UserTaskSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE; 