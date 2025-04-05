import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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