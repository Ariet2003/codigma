/*
  Warnings:

  - You are about to drop the column `createdAt` on the `TaskSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `TaskSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `TaskSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `TaskSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TaskSubmission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[participantId,taskId,hackathonId]` on the table `TaskSubmission` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `status` on the `TaskSubmission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "TaskSubmission" DROP CONSTRAINT "TaskSubmission_hackathonId_fkey";

-- DropForeignKey
ALTER TABLE "TaskSubmission" DROP CONSTRAINT "TaskSubmission_participantId_fkey";

-- DropIndex
DROP INDEX "TaskSubmission_hackathonId_idx";

-- DropIndex
DROP INDEX "TaskSubmission_participantId_idx";

-- DropIndex
DROP INDEX "TaskSubmission_taskId_idx";

-- AlterTable
ALTER TABLE "TaskSubmission" DROP COLUMN "createdAt",
DROP COLUMN "feedback",
DROP COLUMN "score",
DROP COLUMN "submittedAt",
DROP COLUMN "updatedAt",
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "memory" DROP NOT NULL,
ALTER COLUMN "memory" DROP DEFAULT,
ALTER COLUMN "executionTime" DROP NOT NULL,
ALTER COLUMN "executionTime" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "TaskSubmission_participantId_taskId_hackathonId_key" ON "TaskSubmission"("participantId", "taskId", "hackathonId");

-- AddForeignKey
ALTER TABLE "TaskSubmission" ADD CONSTRAINT "TaskSubmission_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "HackathonParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSubmission" ADD CONSTRAINT "TaskSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSubmission" ADD CONSTRAINT "TaskSubmission_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
