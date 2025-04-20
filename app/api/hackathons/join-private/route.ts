import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { hackathonId } = body;

    if (!hackathonId) {
      return NextResponse.json(
        { error: "ПИН хакатона не указан" },
        { status: 400 }
      );
    }

    // 1. Проверяем существование закрытого хакатона
    const hackathon = await prisma.hackathon.findFirst({
      where: {
        id: hackathonId,
        isOpen: false,
      },
    });

    if (!hackathon) {
      return NextResponse.json(
        { error: "Закрытый хакатон с указанным ПИН не найден" },
        { status: 404 }
      );
    }

    // 2. Проверяем, не является ли пользователь уже участником
    const existingParticipant = await prisma.hackathonParticipant.findFirst({
      where: {
        userId: session.user.id,
        hackathonId: hackathonId,
      },
    });

    if (existingParticipant) {
      return NextResponse.json(
        { error: "Вы уже являетесь участником этого хакатона" },
        { status: 400 }
      );
    }

    // 3. Проверяем статус хакатона (должен быть предстоящим)
    const now = new Date();
    if (new Date(hackathon.startDate) <= now) {
      return NextResponse.json(
        { error: "Хакатон уже начался, регистрация закрыта" },
        { status: 400 }
      );
    }

    if (new Date(hackathon.endDate) <= now) {
      return NextResponse.json(
        { error: "Хакатон уже завершен" },
        { status: 400 }
      );
    }

    // Проверяем, не подавал ли пользователь уже заявку
    const existingRequest = await prisma.participationRequest.findFirst({
      where: {
        userId: session.user.id,
        hackathonId: hackathonId,
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "REJECTED") {
        return NextResponse.json(
          { error: "Ваша заявка на участие была отклонена" },
          { status: 400 }
        );
      }
      if (existingRequest.status === "PENDING") {
        return NextResponse.json(
          { error: "Вы уже подали заявку на участие в этом хакатоне" },
          { status: 400 }
        );
      }
    }

    // 4. Создаем заявку на участие
    await prisma.participationRequest.create({
      data: {
        userId: session.user.id,
        hackathonId: hackathonId,
        status: "PENDING",
      },
    });

    return NextResponse.json({ message: "Заявка на участие успешно отправлена" });
  } catch (error) {
    console.error("[HACKATHON_JOIN_PRIVATE]", error);
    return NextResponse.json(
      { error: "Произошла внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 