-- AlterTable
ALTER TABLE "Hackathon" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Hackathon_userId_idx" ON "Hackathon"("userId");

-- AddForeignKey
ALTER TABLE "Hackathon" ADD CONSTRAINT "Hackathon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
