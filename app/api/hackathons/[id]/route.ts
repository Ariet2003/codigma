import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

// Функция для сериализации хакатона
const serializeHackathon = (hackathon: any) => ({
  ...hackathon,
  id: String(hackathon.id),
  participants: hackathon.participants?.map((p: any) => ({
    ...p,
    id: String(p.id),
    userId: String(p.userId),
    hackathonId: String(p.hackathonId)
  })) || [],
  applications: hackathon.applications?.map((a: any) => ({
    ...a,
    id: String(a.id),
    userId: String(a.userId),
    hackathonId: String(a.hackathonId)
  })) || [],
  submissions: hackathon.submissions?.map(serializeSubmission) || []
});

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

    // Сериализуем хакатон и добавляем задачи
    const serializedHackathon = serializeHackathon(hackathon);
    return NextResponse.json({
      ...serializedHackathon,
      tasks: tasks.map(task => ({
        ...task,
        id: String(task.id)
      }))
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
      // Получаем список участников для обновления их счетчиков
      prisma.hackathonParticipant.findMany({
        where: { hackathonId: params.id },
        select: { userId: true }
      }).then(participants => 
        prisma.user.updateMany({
          where: { id: { in: participants.map(p => p.userId) } },
          data: {
            hackathonsParticipated: {
              decrement: 1
            }
          }
        })
      ),
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