-- AlterTable
ALTER TABLE "TaskSubmission" ADD COLUMN     "testsPassed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "testsTotal" INTEGER NOT NULL DEFAULT 0;
