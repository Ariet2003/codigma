/*
  Warnings:

  - You are about to drop the column `userId` on the `Hackathon` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Hackathon" DROP CONSTRAINT "Hackathon_userId_fkey";

-- DropIndex
DROP INDEX "Hackathon_userId_idx";

-- AlterTable
ALTER TABLE "Hackathon" DROP COLUMN "userId";
