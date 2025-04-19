import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Получаем taskId из URL параметров, если он есть
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');

    // Находим участника хакатона
    const participant = await prisma.hackathonParticipant.findFirst({
      where: {
        hackathonId: params.id,
        userId: session.user.id
      }
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Вы не являетесь участником этого хакатона" },
        { status: 403 }
      );
    }

    // Формируем условия запроса
    const where = {
      participantId: participant.id,
      ...(taskId ? { taskId } : {})
    };

    // Получаем решения
    const submissions = await prisma.taskSubmission.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        status: true,
        language: true,
        testsPassed: true,
        testsTotal: true,
        memory: true,
        executionTime: true,
        createdAt: true
      }
    });

    // Преобразуем BigInt в строки для JSON
    const formattedSubmissions = submissions.map(submission => ({
      ...submission,
      memory: submission.memory ? submission.memory.toString() : null,
      executionTime: submission.executionTime ? submission.executionTime.toString() : null
    }));

    return NextResponse.json(formattedSubmissions);
  } catch (error) {
    console.error("[HACKATHON_SUBMISSIONS]", error);
    return NextResponse.json(
      { error: "Произошла ошибка при получении решений" },
      { status: 500 }
    );
  }
} 