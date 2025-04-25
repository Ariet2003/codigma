import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Submission = {
  taskId: string;
  status: string;
};

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const difficulty = searchParams.get("difficulty");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "title";
    const order = searchParams.get("order") || "asc";
    const ids = searchParams.get("ids")?.split(",") || [];
    const hackathonId = searchParams.get("hackathonId");

    const skip = (page - 1) * limit;

    // Базовые условия для WHERE
    const where: any = {};
    
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    
    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty.toUpperCase();
    }

    // Получаем задачи с дополнительной статистикой
    const tasks = await prisma.task.findMany({
      where,
      take: limit,
      skip,
      orderBy: {
        [sortBy]: order
      },
      include: {
        userSubmissions: {
          select: {
            id: true,
            status: true,
            userId: true
          }
        },
        testCases: {
          select: {
            id: true
          }
        }
      }
    });

    let tasksWithStatus;

    if (hackathonId) {
      // Для задач хакатона
      const participant = await prisma.hackathonParticipant.findFirst({
        where: {
          userId: session.user.id,
          hackathonId: hackathonId
        }
      });

      if (participant) {
        // Получаем все решения задач участника
        const submissions = await prisma.taskSubmission.findMany({
          where: {
            participantId: participant.id,
            taskId: {
              in: tasks.map(t => t.id)
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          distinct: ['taskId'],
          select: {
            taskId: true,
            status: true
          }
        });

        // Создаем Map для быстрого доступа к статусам
        const statusMap = new Map(
          submissions.map(s => [s.taskId, s.status])
        );

        tasksWithStatus = tasks.map(task => ({
          ...task,
          status: statusMap.get(task.id) || 'NOT_STARTED',
          isSolved: statusMap.get(task.id) === 'ACCEPTED'
        }));

        // Применяем фильтр по статусу если он указан
        if (status && status !== 'all') {
          tasksWithStatus = tasksWithStatus.filter(task => {
            if (status === 'solved') return task.isSolved;
            if (status === 'unsolved') return !task.isSolved;
            return true;
          });
        }
      } else {
        tasksWithStatus = tasks.map(task => ({
          ...task,
          status: 'NOT_STARTED',
          isSolved: false
        }));
      }
    } else {
      // Для обычных задач
      const userSolvedTasks = await prisma.userTaskSubmission.findMany({
        where: {
          userId: session.user.id,
          status: 'ACCEPTED'
        },
        select: {
          taskId: true
        },
        distinct: ['taskId']
      });

      const solvedTaskIds = new Set(userSolvedTasks.map(t => t.taskId));
      tasksWithStatus = tasks.map(task => {
        // Подсчитываем уникальных пользователей, решивших задачу
        const uniqueAcceptedUsers = new Set(
          task.userSubmissions
            .filter(s => s.status === 'ACCEPTED')
            .map(s => s.userId)
        );

        return {
          ...task,
          isSolved: solvedTaskIds.has(task.id),
          uniqueAcceptedCount: uniqueAcceptedUsers.size,
          attempts: task.userSubmissions.length,
          testCount: task.testCases.length,
          userSubmissions: undefined // Удаляем ненужные данные из ответа
        };
      });

      // Применяем фильтр по статусу если он указан
      if (status && status !== 'all') {
        tasksWithStatus = tasksWithStatus.filter(task => {
          if (status === 'solved') return task.isSolved;
          if (status === 'unsolved') return !task.isSolved;
          return true;
        });
      }
    }

    // Если запрашиваются конкретные задачи по ID
    if (ids.length) {
      return NextResponse.json({ tasks: tasksWithStatus });
    }

    // Получаем общее количество задач для пагинации
    const total = tasksWithStatus.length;

    return NextResponse.json({
      tasks: tasksWithStatus,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("[TASKS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Создаем задачу
    const task = await prisma.task.create({
      data: {
        title: data.title,
        difficulty: data.difficulty,
        description: data.description,
        functionName: data.function_name,
        inputParams: data.input_params,
        outputParams: data.output_params,
        testCases: {
          create: data.test_cases.map((test: any) => ({
            input: test.input,
            expectedOutput: String(test.expected_output)
          }))
        },
        codeTemplates: {
          create: [
            {
              language: 'cpp',
              baseTemplate: data.templates.cpp.base,
              fullTemplate: data.templates.cpp.full
            },
            {
              language: 'js',
              baseTemplate: data.templates.js.base,
              fullTemplate: data.templates.js.full
            },
            {
              language: 'rust',
              baseTemplate: data.templates.rust.base,
              fullTemplate: data.templates.rust.full
            },
            {
              language: 'java',
              baseTemplate: data.templates.java.base,
              fullTemplate: data.templates.java.full
            }
          ]
        }
      },
      include: {
        testCases: true,
        codeTemplates: true
      }
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Ошибка при сохранении задачи:", error);
    return NextResponse.json(
      { error: "Ошибка при сохранении задачи" },
      { status: 500 }
    );
  }
} 