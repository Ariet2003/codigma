import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Status } from "@prisma/client";

const judge0_language_ids = {
  cpp: 54,
  js: 63,
  rust: 73,
  java: 62
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { hackathonId, taskId, language, code } = await req.json();

    // Проверяем, существует ли хакатон
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        participants: {
          where: { userId: session.user.id }
        }
      }
    });

    if (!hackathon) {
      return NextResponse.json(
        { error: "Хакатон не найден" },
        { status: 404 }
      );
    }

    // Проверяем, является ли пользователь участником хакатона
    if (hackathon.participants.length === 0) {
      return NextResponse.json(
        { error: "Вы не являетесь участником этого хакатона" },
        { status: 403 }
      );
    }

    // Проверяем, активен ли хакатон
    const now = new Date();
    if (now < new Date(hackathon.startDate) || now > new Date(hackathon.endDate)) {
      return NextResponse.json(
        { error: "Хакатон не активен" },
        { status: 403 }
      );
    }

    // Получаем задачу с полным шаблоном
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        testCases: true,
        codeTemplates: {
          where: { language },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Задача не найдена" },
        { status: 404 }
      );
    }

    const template = task.codeTemplates[0];
    if (!template) {
      return NextResponse.json(
        { error: "Шаблон для выбранного языка не найден" },
        { status: 404 }
      );
    }

    // Подставляем код пользователя в полный шаблон
    const sourceCode = template.fullTemplate.replace("##USER_CODE_HERE##", code);

    // Отправляем запрос на выполнение кода
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    const response = await fetch(`${baseUrl}/api/judge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language_id: judge0_language_ids[language as keyof typeof judge0_language_ids],
        source_code: sourceCode,
        testcases: task.testCases.map(tc => ({
          stdin: tc.input,
          expected_output: tc.expectedOutput
        }))
      })
    });

    if (!response.ok) {
      throw new Error('Failed to execute code');
    }

    const result = await response.json();

    // Определяем статус выполнения
    let status: Status = Status.REJECTED;
    if (result.correct_tests_count === result.tests_count) {
      status = Status.ACCEPTED;
    } else if (result.first_stderr?.includes("Time Limit Exceeded") || result.first_stderr?.includes("Compilation Error")) {
      status = Status.ERROR;
    }

    // Создаем запись о решении
    const submission = await prisma.taskSubmission.create({
      data: {
        code,
        language,
        status,
        testsPassed: result.correct_tests_count,
        testsTotal: result.tests_count,
        memory: result.total_memory || null,
        executionTime: result.total_time ? BigInt(result.total_time) : null,
        participant: {
          connect: {
            id: hackathon.participants[0].id
          }
        },
        task: {
          connect: {
            id: taskId
          }
        },
        hackathon: {
          connect: {
            id: hackathonId
          }
        }
      }
    });

    // Если все тесты пройдены, обновляем счет участника
    if (status === Status.ACCEPTED) {
      await prisma.hackathonParticipant.update({
        where: {
          id: hackathon.participants[0].id
        },
        data: {
          totalScore: {
            increment: task.difficulty === 'easy' ? 100 :
                      task.difficulty === 'medium' ? 200 :
                      task.difficulty === 'hard' ? 300 : 0
          }
        }
      });
    }

    return NextResponse.json({
      ...result,
      submissionId: submission.id
    });
  } catch (error) {
    console.error("[HACKATHON_SUBMIT]", error);
    return NextResponse.json(
      { error: "Произошла ошибка при отправке решения" },
      { status: 500 }
    );
  }
} 