import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const task = await prisma.task.findUnique({
      where: {
        id: params.id,
      },
      include: {
        testCases: true,
        codeTemplates: true,
        submissions: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeTask(task));
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
    // Сначала удаляем все связанные записи
    await prisma.$transaction([
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