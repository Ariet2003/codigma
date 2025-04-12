import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const difficulty = searchParams.get("difficulty") || "all";
    const sortBy = searchParams.get("sortBy") || "title";
    const order = searchParams.get("order") || "asc";
    const status = searchParams.get("status") || "all";

    // Формируем условия фильтрации
    const where = {
      ...(difficulty !== "all" && {
        difficulty: difficulty,
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(status === "solved" && {
        submissions: {
          some: {
            participant: {
              userId: session.user.id
            },
            status: "ACCEPTED"
          }
        }
      }),
      ...(status === "unsolved" && {
        NOT: {
          submissions: {
            some: {
              participant: {
                userId: session.user.id
              },
              status: "ACCEPTED"
            }
          }
        }
      })
    };

    // Получаем общее количество задач
    const total = await prisma.task.count({ where });

    // Определяем параметры сортировки
    let orderBy: any = {};
    
    switch (sortBy) {
      case 'attempts':
        orderBy = {
          submissions: {
            _count: true
          }
        };
        break;
      case 'acceptedCount':
        orderBy = {
          submissions: {
            where: {
              status: "ACCEPTED"
            },
            _count: true
          }
        };
        break;
      case 'status':
        orderBy = {
          submissions: {
            where: {
              participant: {
                userId: session.user.id
              },
              status: "ACCEPTED"
            },
            _count: true
          }
        };
        break;
      default:
        orderBy = {
          [sortBy]: order
        };
    }

    // Получаем задачи с пагинацией и сортировкой
    const tasks = await prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: sortBy === 'title' || sortBy === 'difficulty' 
        ? { [sortBy]: order }
        : [orderBy, { title: 'asc' }],
      select: {
        id: true,
        title: true,
        difficulty: true,
        description: true,
        functionName: true,
        inputParams: true,
        outputParams: true,
        createdAt: true,
        updatedAt: true,
        testCases: {
          select: {
            id: true
          }
        }
      }
    });

    // Форматируем данные для фронтенда
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      difficulty: task.difficulty,
      description: task.description,
      functionName: task.functionName,
      inputParams: task.inputParams,
      outputParams: task.outputParams,
      test_count: task.testCases.length,
      created_at: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    }));

    return NextResponse.json({
      tasks: formattedTasks,
      total: total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
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