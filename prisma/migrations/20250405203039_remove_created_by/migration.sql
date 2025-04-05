/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Hackathon` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Hackathon" DROP CONSTRAINT "Hackathon_createdBy_fkey";

-- DropIndex
DROP INDEX "Hackathon_createdBy_idx";

-- AlterTable
ALTER TABLE "Hackathon" DROP COLUMN "createdBy";
