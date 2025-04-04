/*
  Warnings:

  - You are about to drop the column `baseTemplate` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `fullTemplate` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "baseTemplate",
DROP COLUMN "fullTemplate";

-- CreateTable
CREATE TABLE "CodeTemplate" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "baseTemplate" TEXT NOT NULL,
    "fullTemplate" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CodeTemplate_taskId_idx" ON "CodeTemplate"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeTemplate_taskId_language_key" ON "CodeTemplate"("taskId", "language");

-- AddForeignKey
ALTER TABLE "CodeTemplate" ADD CONSTRAINT "CodeTemplate_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
