-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'PROCESSING', 'ACCEPTED', 'REJECTED', 'ERROR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hackathonsParticipated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "HackathonParticipant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "HackathonParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipationRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParticipationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskSubmission" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feedback" TEXT,
    "memory" INTEGER NOT NULL DEFAULT 0,
    "executionTime" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HackathonParticipant_hackathonId_idx" ON "HackathonParticipant"("hackathonId");

-- CreateIndex
CREATE INDEX "HackathonParticipant_userId_idx" ON "HackathonParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HackathonParticipant_userId_hackathonId_key" ON "HackathonParticipant"("userId", "hackathonId");

-- CreateIndex
CREATE INDEX "ParticipationRequest_hackathonId_idx" ON "ParticipationRequest"("hackathonId");

-- CreateIndex
CREATE INDEX "ParticipationRequest_userId_idx" ON "ParticipationRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipationRequest_userId_hackathonId_key" ON "ParticipationRequest"("userId", "hackathonId");

-- CreateIndex
CREATE INDEX "TaskSubmission_participantId_idx" ON "TaskSubmission"("participantId");

-- CreateIndex
CREATE INDEX "TaskSubmission_hackathonId_idx" ON "TaskSubmission"("hackathonId");

-- CreateIndex
CREATE INDEX "TaskSubmission_taskId_idx" ON "TaskSubmission"("taskId");

-- AddForeignKey
ALTER TABLE "HackathonParticipant" ADD CONSTRAINT "HackathonParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HackathonParticipant" ADD CONSTRAINT "HackathonParticipant_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipationRequest" ADD CONSTRAINT "ParticipationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipationRequest" ADD CONSTRAINT "ParticipationRequest_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSubmission" ADD CONSTRAINT "TaskSubmission_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "HackathonParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSubmission" ADD CONSTRAINT "TaskSubmission_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
