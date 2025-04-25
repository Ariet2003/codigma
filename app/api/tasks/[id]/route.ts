import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

// Функция для сериализации задачи
const serializeTask = (task: any) => ({
  ...task,
  id: String(task.id),
  testCases: task.testCases?.map((testCase: any) => ({
    ...testCase,
    id: String(testCase.id),
    taskId: String(testCase.taskId)
  })) || [],
  codeTemplates: task.codeTemplates?.map((template: any) => ({
    ...template,
    id: String(template.id),
    taskId: String(template.taskId)
  })) || [],
  submissions: task.submissions?.map(serializeSubmission) || []
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Получаем параметр hackathonId из URL
    const url = new URL(request.url);
    const hackathonId = url.searchParams.get('hackathonId');

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        testCases: true,
        codeTemplates: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    let stats;
    if (hackathonId) {
      // Получаем статистику из TaskSubmission для хакатона
      const submissions = await prisma.taskSubmission.findMany({
        where: {
          taskId: params.id,
          participant: {
            hackathonId: hackathonId
          }
        }
      });

      const acceptedSubmissions = submissions.filter(s => s.status === 'ACCEPTED');
      
      // Находим лучшие показатели памяти и времени среди успешных решений
      let bestMemory = null;
      let bestTime = null;
      if (acceptedSubmissions.length > 0) {
        bestMemory = Math.min(...acceptedSubmissions.map(s => Number(s.memory || Infinity)));
        bestTime = Math.min(...acceptedSubmissions.map(s => Number(s.executionTime || Infinity)));
      }

      // Собираем статистику по языкам
      const languageStats = await prisma.taskSubmission.groupBy({
        by: ['language'],
        where: {
          taskId: params.id,
          participant: {
            hackathonId: hackathonId
          }
        },
        _count: {
          _all: true
        }
      });

      const languageSuccessStats = await prisma.taskSubmission.groupBy({
        by: ['language'],
        where: {
          taskId: params.id,
          status: 'ACCEPTED',
          participant: {
            hackathonId: hackathonId
          }
        },
        _count: {
          _all: true
        }
      });

      stats = {
        totalSubmissions: submissions.length,
        acceptedSubmissions: acceptedSubmissions.length,
        bestMemory: bestMemory === null ? null : bestMemory.toString(),
        bestTime: bestTime === null ? null : bestTime,
        languageStats: languageStats.map(lang => ({
          language: lang.language,
          totalAttempts: lang._count._all,
          successfulAttempts: languageSuccessStats.find(s => s.language === lang.language)?._count._all || 0,
          successRate: ((languageSuccessStats.find(s => s.language === lang.language)?._count._all || 0) / lang._count._all) * 100
        }))
      };
    } else {
      // Существующая логика для UserTaskSubmission
      const submissions = await prisma.userTaskSubmission.findMany({
        where: {
          taskId: params.id
        }
      });

      // ... существующий код для UserTaskSubmission ...
    }

    // Проверяем статус решения
    let isSolved = false;
    if (hackathonId) {
      const participant = await prisma.hackathonParticipant.findFirst({
        where: {
          hackathonId: hackathonId,
          userId: session.user.id
        }
      });

      if (participant) {
        const submission = await prisma.taskSubmission.findFirst({
          where: {
            taskId: params.id,
            participantId: participant.id,
            status: 'ACCEPTED'
          }
        });
        isSolved = !!submission;
      }
    } else {
      const submission = await prisma.userTaskSubmission.findFirst({
        where: {
          taskId: params.id,
          userId: session.user.id,
          status: 'ACCEPTED'
        }
      });
      isSolved = !!submission;
    }

    return NextResponse.json({
      ...task,
      stats,
      isSolved
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Обновляем задачу и связанные данные
    const task = await prisma.$transaction(async (tx) => {
      // Удаляем существующие тесты и шаблоны
      await tx.testCase.deleteMany({
        where: { taskId: params.id }
      });
      await tx.codeTemplate.deleteMany({
        where: { taskId: params.id }
      });

      // Обновляем задачу
      return tx.task.update({
        where: { id: params.id },
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
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Ошибка при обновлении задачи:", error);
    return NextResponse.json(
      { error: "Произошла ошибка при обновлении задачи" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Удаляем все связанные записи в транзакции
    await prisma.$transaction([
      // Удаляем отправки решений пользователей
      prisma.userTaskSubmission.deleteMany({
        where: { taskId: params.id },
      }),
      // Удаляем отправки решений участников хакатона
      prisma.taskSubmission.deleteMany({
        where: { taskId: params.id },
      }),
      // Удаляем тестовые случаи
      prisma.testCase.deleteMany({
        where: { taskId: params.id },
      }),
      // Удаляем шаблоны кода
      prisma.codeTemplate.deleteMany({
        where: { taskId: params.id },
      }),
      // Теперь удаляем саму задачу
      prisma.task.delete({
        where: { id: params.id },
      }),
    ]);

    return NextResponse.json({ message: "Задача успешно удалена" });
  } catch (error) {
    console.error("Ошибка при удалении задачи:", error);
    return NextResponse.json(
      { error: "Произошла ошибка при удалении задачи" },
      { status: 500 }
    );
  }
} 