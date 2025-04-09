/*
  Warnings:

  - The `status` column on the `TaskSubmission` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'PROCESSING', 'ACCEPTED', 'REJECTED', 'ERROR');

-- DropForeignKey
ALTER TABLE "TaskSubmission" DROP CONSTRAINT "TaskSubmission_hackathonId_fkey";

-- DropIndex
DROP INDEX "TaskSubmission_participantId_taskId_hackathonId_key";

-- AlterTable
ALTER TABLE "TaskSubmission" ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "hackathonId" DROP NOT NULL,
ALTER COLUMN "language" DROP NOT NULL,
ALTER COLUMN "memory" SET DATA TYPE BIGINT,
ALTER COLUMN "executionTime" SET DATA TYPE BIGINT,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "SubmissionStatus";

-- CreateIndex
CREATE INDEX "TaskSubmission_participantId_idx" ON "TaskSubmission"("participantId");

-- CreateIndex
CREATE INDEX "TaskSubmission_taskId_idx" ON "TaskSubmission"("taskId");

-- CreateIndex
CREATE INDEX "TaskSubmission_hackathonId_idx" ON "TaskSubmission"("hackathonId");

-- AddForeignKey
ALTER TABLE "TaskSubmission" ADD CONSTRAINT "TaskSubmission_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
