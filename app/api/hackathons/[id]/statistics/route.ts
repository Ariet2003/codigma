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

    // Получаем хакатон
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!hackathon) {
      return new NextResponse("Hackathon not found", { status: 404 });
    }

    // Получаем задачи
    const tasks = await prisma.task.findMany({
      where: {
        id: {
          in: hackathon.tasks as string[],
        },
      },
    });

    // Получаем все решения для хакатона
    const submissions = await prisma.taskSubmission.findMany({
      where: { hackathonId: params.id },
      include: {
        task: true,
        participant: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    // Получаем заявки на участие (для закрытых хакатонов)
    const requests = !hackathon.isOpen
      ? await prisma.participationRequest.findMany({
          where: { hackathonId: params.id },
        })
      : [];

    // Статистика заявок
    const requestsStats = !hackathon.isOpen
      ? [
          {
            name: 'PENDING',
            value: requests.filter((r) => r.status === 'PENDING').length,
          },
          {
            name: 'APPROVED',
            value: requests.filter((r) => r.status === 'APPROVED').length,
          },
          {
            name: 'REJECTED',
            value: requests.filter((r) => r.status === 'REJECTED').length,
          },
        ]
      : [];

    // Статистика решений
    const submissionsStats = [
      {
        name: 'ACCEPTED',
        value: submissions.filter((s) => s.status === 'ACCEPTED').length,
      },
      {
        name: 'REJECTED',
        value: submissions.filter((s) => s.status === 'REJECTED').length,
      },
      {
        name: 'ERROR',
        value: submissions.filter((s) => s.status === 'ERROR').length,
      },
      {
        name: 'PROCESSING',
        value: submissions.filter((s) => s.status === 'PROCESSING').length,
      },
    ];

    // График активности
    const activityData = submissions.reduce((acc: any[], submission) => {
      const hour = new Date().getHours(); // Используем текущий час, так как createdAt отсутствует
      const existingHour = acc.find((item) => item.time === hour);
      
      if (existingHour) {
        existingHour.submissions += 1;
      } else {
        acc.push({ time: hour, submissions: 1 });
      }
      
      return acc;
    }, []).sort((a, b) => a.time - b.time);

    // Статистика по задачам
    const taskStats = tasks.map((task) => {
      const taskSubmissions = submissions.filter((s) => s.taskId === task.id);
      return {
        name: task.title,
        accepted: taskSubmissions.filter((s) => s.status === 'ACCEPTED').length,
        rejected: taskSubmissions.filter((s) => s.status === 'REJECTED').length,
      };
    });

    // Статистика языков программирования
    const languageStats = submissions.reduce((acc: any[], submission) => {
      const language = submission.language;
      const existingLanguage = acc.find((item) => item.name === language);
      
      if (existingLanguage) {
        existingLanguage.value += 1;
      } else {
        acc.push({ name: language, value: 1 });
      }
      
      return acc;
    }, []);

    // Детальная статистика по задачам
    const taskDetailedStats = tasks.map((task) => {
      const taskSubmissions = submissions.filter((s) => s.taskId === task.id);
      const successfulSubmissions = taskSubmissions.filter((s) => s.status === 'ACCEPTED');
      
      return {
        id: task.id,
        name: task.title,
        totalAttempts: taskSubmissions.length,
        successfulAttempts: successfulSubmissions.length,
        successRate: taskSubmissions.length > 0
          ? Math.round((successfulSubmissions.length / taskSubmissions.length) * 100)
          : 0,
        avgExecutionTime: successfulSubmissions.length > 0
          ? Math.round(
              Number(successfulSubmissions.reduce((sum, s) => sum + (s.executionTime ? Number(s.executionTime) : 0), 0)) /
              successfulSubmissions.length
            )
          : 0,
        avgMemoryUsage: successfulSubmissions.length > 0
          ? Math.round(
              Number(successfulSubmissions.reduce((sum, s) => sum + (s.memory ? Number(s.memory) : 0), 0)) /
              successfulSubmissions.length
            )
          : 0,
      };
    });

    return NextResponse.json({
      isOpen: hackathon.isOpen,
      startDate: hackathon.startDate,
      endDate: hackathon.endDate,
      totalParticipants: hackathon.participants.length,
      totalTasks: tasks.length,
      requestsStats,
      submissionsStats,
      activityData,
      taskStats,
      languageStats,
      taskDetailedStats,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 