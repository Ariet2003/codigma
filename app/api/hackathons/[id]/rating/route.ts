import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Получаем хакатон с участниками
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        tasks: true,
      },
    });

    if (!hackathon) {
      return new NextResponse("Hackathon not found", { status: 404 });
    }

    const participants = await prisma.hackathonParticipant.findMany({
      where: {
        hackathonId: params.id,
      },
      select: {
        id: true,
        joinedAt: true,
        totalScore: true,
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    const submissions = await prisma.taskSubmission.findMany({
      where: {
        hackathonId: params.id,
      },
      select: {
        id: true,
        status: true,
        taskId: true,
        participantId: true,
        testsPassed: true,
        testsTotal: true
      }
    });

    const tasks = await prisma.task.findMany({
      where: {
        id: {
          in: hackathon.tasks,
        },
      },
      select: {
        id: true,
        title: true,
        difficulty: true
      }
    });

    // Формируем рейтинг участников
    const participantsRating = participants.map((participant) => {
      const userSubmissions = submissions.filter(
        (s) => s.participantId === participant.id
      );
      
      const solvedTasks = new Set(
        userSubmissions
          .filter((s) => s.status === "ACCEPTED")
          .map((s) => s.taskId)
      );

      // Подсчитываем процент пройденных тестов для каждого решения
      const submissionScores = userSubmissions
        .filter((s) => s.status === "ACCEPTED")
        .map(s => (s.testsPassed / s.testsTotal) * 100);

      // Считаем средний балл по всем успешным решениям
      const averageScore = submissionScores.length > 0
        ? submissionScores.reduce((sum, score) => sum + score, 0) / submissionScores.length
        : 0;

      const averageAttempts = userSubmissions.length / solvedTasks.size || 0;

      return {
        id: participant.id,
        name: participant.user.name || "Аноним",
        email: participant.user.email,
        joinedAt: participant.joinedAt ? new Date(participant.joinedAt).toISOString() : null,
        totalScore: participant.totalScore || averageScore, // Используем totalScore из базы или вычисляем
        solvedTasksCount: solvedTasks.size,
        totalSubmissions: userSubmissions.length,
        averageAttempts: Number(averageAttempts.toFixed(2)),
      };
    });

    return NextResponse.json(participantsRating);
  } catch (error) {
    console.error("Error fetching rating:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 