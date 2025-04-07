import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
      include: {
        participants: true,
        applications: true,
        submissions: true,
      },
    });

    if (!hackathon) {
      return NextResponse.json(
        { message: "Хакатон не найден" },
        { status: 404 }
      );
    }

    // Получаем информацию о задачах
    const tasks = await prisma.task.findMany({
      where: {
        id: {
          in: hackathon.tasks as string[],
        },
      },
      select: {
        id: true,
        title: true,
        difficulty: true,
      },
    });

    return NextResponse.json({
      ...hackathon,
      tasks,
    });
  } catch (error) {
    console.error("Ошибка при получении хакатона:", error);
    return NextResponse.json(
      { message: "Произошла ошибка при получении хакатона" },
      { status: 500 }
    );
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
    await prisma.$transaction([
      // Удаляем решения задач
      prisma.taskSubmission.deleteMany({
        where: { hackathonId: params.id },
      }),
      // Удаляем заявки на участие
      prisma.participationRequest.deleteMany({
        where: { hackathonId: params.id },
      }),
      // Удаляем участников
      prisma.hackathonParticipant.deleteMany({
        where: { hackathonId: params.id },
      }),
      // Удаляем сам хакатон
      prisma.hackathon.delete({
        where: { id: params.id },
      }),
    ]);

    return NextResponse.json({ message: "Хакатон успешно удален" });
  } catch (error) {
    console.error("Ошибка при удалении хакатона:", error);
    return NextResponse.json(
      { message: "Произошла ошибка при удалении хакатона" },
      { status: 500 }
    );
  }
} 