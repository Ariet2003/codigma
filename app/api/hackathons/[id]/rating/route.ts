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
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const submissions = await prisma.taskSubmission.findMany({
      where: {
        hackathonId: params.id,
      },
      include: {
        task: true,
      },
    });

    const tasks = await prisma.task.findMany({
      where: {
        id: {
          in: hackathon.tasks,
        },
      },
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

      const totalScore = userSubmissions
        .filter((s) => s.status === "ACCEPTED")
        .reduce((sum, s) => sum + (s.score || 0), 0);

      const averageAttempts = userSubmissions.length / solvedTasks.size || 0;

      return {
        id: participant.id,
        name: participant.user.name || "Аноним",
        email: participant.user.email,
        joinedAt: participant.createdAt ? new Date(participant.createdAt).toISOString() : null,
        totalScore,
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