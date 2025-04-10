import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const { id: hackathonId, requestId } = params;
    const { status } = await request.json();
    
    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Неверный статус" },
        { status: 400 }
      );
    }
    
    // Проверяем, существует ли хакатон
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });
    
    if (!hackathon) {
      return NextResponse.json(
        { error: "Хакатон не найден" },
        { status: 404 }
      );
    }
    
    // Проверяем, существует ли заявка
    const participationRequest = await prisma.participationRequest.findUnique({
      where: { id: requestId },
    });
    
    if (!participationRequest) {
      return NextResponse.json(
        { error: "Заявка не найдена" },
        { status: 404 }
      );
    }
    
    // Обновляем статус заявки
    const updatedRequest = await prisma.participationRequest.update({
      where: { id: requestId },
      data: { status },
    });
    
    // Если заявка одобрена, добавляем пользователя в участники хакатона
    if (status === "APPROVED") {
      // Проверяем, существует ли уже запись
      const existingParticipant = await prisma.hackathonParticipant.findFirst({
        where: {
          hackathonId: hackathonId,
          userId: participationRequest.userId,
        },
      });

      // Создаем запись только если её ещё нет
      if (!existingParticipant) {
        await prisma.$transaction([
          // Создаем запись об участии
          prisma.hackathonParticipant.create({
            data: {
              hackathonId: hackathonId,
              userId: participationRequest.userId,
            },
          }),
          // Увеличиваем счетчик участия в хакатонах
          prisma.user.update({
            where: { id: participationRequest.userId },
            data: {
              hackathonsParticipated: {
                increment: 1
              }
            }
          })
        ]);
      }
    }
    // Если заявка отклонена, удаляем пользователя из участников хакатона
    else if (status === "REJECTED") {
      const existingParticipant = await prisma.hackathonParticipant.findFirst({
        where: {
          hackathonId: hackathonId,
          userId: participationRequest.userId,
        },
      });

      if (existingParticipant) {
        await prisma.$transaction([
          // Удаляем запись об участии
          prisma.hackathonParticipant.delete({
            where: {
              id: existingParticipant.id
            },
          }),
          // Уменьшаем счетчик участия в хакатонах
          prisma.user.update({
            where: { id: participationRequest.userId },
            data: {
              hackathonsParticipated: {
                decrement: 1
              }
            }
          })
        ]);
      }
    }
    
    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    console.error("Ошибка при обновлении заявки:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 