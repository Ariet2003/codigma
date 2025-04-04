import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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