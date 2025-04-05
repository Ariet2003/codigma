import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const difficulty = searchParams.get("difficulty") || undefined;
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    const skip = (page - 1) * limit;

    // Построение условия where для поиска
    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(difficulty && { difficulty }),
    };

    let orderBy: any = {};

    // Настройка сортировки
    if (sortBy === "test_count") {
      orderBy = {
        testCases: {
          _count: sortOrder
        }
      };
    } else {
      // Преобразование имен полей из фронтенда в имена полей базы данных
      const fieldMapping: { [key: string]: string } = {
        "created_at": "createdAt",
        "updated_at": "updatedAt",
        "title": "title",
        "difficulty": "difficulty"
      };

      const dbField = fieldMapping[sortBy] || "updatedAt";
      orderBy = { [dbField]: sortOrder };
    }

    // Получение задач с пагинацией и сортировкой
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        select: {
          id: true,
          title: true,
          difficulty: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          testCases: {
            select: {
              id: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    // Преобразование данных для ответа
    const formattedTasks = tasks.map(task => ({
      ...task,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
      test_count: task.testCases.length,
      createdAt: undefined,
      updatedAt: undefined,
      testCases: undefined,
    }));

    return NextResponse.json({
      tasks: formattedTasks,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Ошибка при получении списка задач:", error);
    return NextResponse.json(
      { error: "Произошла ошибка при получении списка задач" },
      { status: 500 }
    );
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