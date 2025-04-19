import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateHackathonScores } from "../../middleware";

// Функция для сериализации решения
const serializeSubmission = (submission: any) => ({
  ...submission,
  id: String(submission.id),
  participantId: String(submission.participantId),
  taskId: String(submission.taskId),
  hackathonId: submission.hackathonId ? String(submission.hackathonId) : null,
  memory: submission.memory ? Number(submission.memory) : null,
  executionTime: submission.executionTime ? Number(submission.executionTime) : null
});

// Функция для сериализации хакатона
const serializeHackathon = (hackathon: any) => ({
  ...hackathon,
  id: String(hackathon.id),
  participants: hackathon.participants?.map((p: any) => ({
    ...p,
    id: String(p.id),
    userId: String(p.userId),
    hackathonId: String(p.hackathonId)
  })) || [],
  applications: hackathon.applications?.map((a: any) => ({
    ...a,
    id: String(a.id),
    userId: String(a.userId),
    hackathonId: String(a.hackathonId)
  })) || [],
  submissions: hackathon.submissions?.map(serializeSubmission) || []
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            submissions: {
              where: {
                status: 'ACCEPTED'
              },
              orderBy: {
                createdAt: 'desc'
              },
              select: {
                taskId: true,
                memory: true,
                executionTime: true,
                createdAt: true,
                task: {
                  select: {
                    difficulty: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            participants: true
          }
        }
      }
    });

    if (!hackathon) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Проверяем, завершился ли хакатон
    const now = new Date();
    const endDate = new Date(hackathon.endDate);
    
    if (now > endDate) {
      // Проверяем, не обновлены ли уже баллы
      const processedHackathon = await prisma.hackathon.findFirst({
        where: {
          id: params.id,
          participants: {
            some: {
              user: {
                totalScore: {
                  gt: 0
                }
              }
            }
          }
        }
      });

      // Если баллы еще не обновлены, обновляем их
      if (!processedHackathon) {
        await updateHackathonScores(params.id);
      }
    }

    // Получаем все отправки текущего пользователя
    const userSubmissions = await prisma.taskSubmission.findMany({
      where: {
        hackathonId: params.id,
        participant: {
          userId: session.user.id
        }
      }
    });

    // Получаем принятые отправки текущего пользователя
    const userAcceptedSubmissions = await prisma.taskSubmission.findMany({
      where: {
        hackathonId: params.id,
        participant: {
          userId: session.user.id
        },
        status: 'ACCEPTED'
      }
    });

    // Получаем уникальные решенные задачи текущего пользователя
    const uniqueSolvedTasks = await prisma.taskSubmission.findMany({
      where: {
        hackathonId: params.id,
        participant: {
          userId: session.user.id
        },
        status: 'ACCEPTED'
      },
      distinct: ['taskId']
    });

    // Получаем текущий рейтинг пользователя
    const currentParticipant = await prisma.hackathonParticipant.findFirst({
      where: {
        hackathonId: params.id,
        userId: session.user.id
      }
    });

    // Функция для получения константы сложности
    const getDifficultyConstant = (difficulty: string) => {
      switch (difficulty.toLowerCase()) {
        case 'easy': return 1000000;
        case 'medium': return 2000000;
        case 'hard': return 3000000;
        default: return 1000000;
    }
    };

    // Обрабатываем всех участников для получения актуальных баллов
    const allParticipants = await Promise.all(hackathon.participants.map(async participant => {
      const uniqueSolvedTasks = new Set(participant.submissions.map(s => s.taskId));
      const latestSolutionsByTask = new Map();
      
      participant.submissions.forEach(submission => {
        if (!latestSolutionsByTask.has(submission.taskId) || 
            submission.createdAt > latestSolutionsByTask.get(submission.taskId).createdAt) {
          latestSolutionsByTask.set(submission.taskId, submission);
        }
      });

      let totalScore = 0;
      latestSolutionsByTask.forEach(submission => {
        const t = Number(submission.executionTime) || 0;
        const m = Number(submission.memory) || 0;
        if (t > 0 && m > 0) {
          const C = getDifficultyConstant(submission.task.difficulty);
          totalScore += Math.log10(C) - Math.log10(Math.sqrt(t * m));
        }
      });

      const finalScore = Number(Math.max(0, totalScore).toFixed(3));

      // Обновляем балл в базе данных
      await prisma.hackathonParticipant.update({
        where: { id: participant.id },
        data: { totalScore: finalScore }
      });

      return {
        id: participant.id,
        user: {
          id: participant.user.id,
          name: participant.user.name,
          image: participant.user.image
        },
        solvedTasks: uniqueSolvedTasks.size,
        score: finalScore
      };
    }));

    // Сортируем всех участников по баллам
    const sortedParticipants = allParticipants.sort((a, b) => b.score - a.score);

    // Находим позицию текущего пользователя
    const currentUserPosition = sortedParticipants.findIndex(p => p.user.id === session.user.id) + 1;
    const currentUserPage = Math.ceil(currentUserPosition / limit);

    // Применяем пагинацию
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedParticipants = sortedParticipants.slice(startIndex, endIndex);

    const formattedHackathon = {
      ...hackathon,
      isParticipating: hackathon.participants.some(p => p.user.id === session.user.id),
      participantsCount: hackathon._count.participants,
      participants: paginatedParticipants,
      currentUserId: session.user.id,
      solvedTasksCount: uniqueSolvedTasks.length,
      totalTasksCount: (hackathon.tasks as string[]).length,
      currentRating: currentParticipant?.totalScore || 0,
      submissionsCount: userSubmissions.length,
      acceptedSubmissionsCount: userAcceptedSubmissions.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(sortedParticipants.length / limit),
        totalParticipants: sortedParticipants.length,
        currentUserPosition,
        currentUserPage
      },
      _count: undefined
    };

    return NextResponse.json(formattedHackathon);
  } catch (error) {
    console.error("[HACKATHON_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const { title, description, startDate, endDate, isOpen, tasks } = data;

    // Проверяем, не начался ли хакатон
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
    });

    if (!hackathon) {
      return NextResponse.json(
        { message: "Хакатон не найден" },
        { status: 404 }
      );
    }

    if (new Date() >= new Date(hackathon.startDate)) {
      return NextResponse.json(
        { message: "Нельзя редактировать начавшийся хакатон" },
        { status: 400 }
      );
    }

    const updatedHackathon = await prisma.hackathon.update({
      where: { id: params.id },
      data: {
        title: title.trim(),
        description: description.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isOpen,
        tasks,
      },
    });

    return NextResponse.json(updatedHackathon);
  } catch (error) {
    console.error("Ошибка при обновлении хакатона:", error);
    return NextResponse.json(
      { message: "Произошла ошибка при обновлении хакатона" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
    });

    if (!hackathon) {
      return NextResponse.json(
        { message: "Хакатон не найден" },
        { status: 404 }
      );
    }

    // Удаляем все связанные данные
    await prisma.$transaction(async (tx) => {
      // Удаляем решения задач
      await tx.taskSubmission.deleteMany({
        where: { hackathonId: params.id },
      });

      // Удаляем заявки на участие
      await tx.participationRequest.deleteMany({
        where: { hackathonId: params.id },
      });

      // Получаем список участников для обновления их счетчиков
      const participants = await tx.hackathonParticipant.findMany({
        where: { hackathonId: params.id },
        select: { userId: true }
      });

      // Обновляем счетчики участников
      if (participants.length > 0) {
        await tx.user.updateMany({
          where: { id: { in: participants.map(p => p.userId) } },
          data: {
            hackathonsParticipated: {
              decrement: 1
            }
          }
        });
      }

      // Удаляем участников
      await tx.hackathonParticipant.deleteMany({
        where: { hackathonId: params.id },
      });

      // Удаляем сам хакатон
      await tx.hackathon.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ message: "Хакатон успешно удален" });
  } catch (error) {
    console.error("Ошибка при удалении хакатона:", error);
    return NextResponse.json(
      { message: "Произошла ошибка при удалении хакатона" },
      { status: 500 }
    );
  }
} 