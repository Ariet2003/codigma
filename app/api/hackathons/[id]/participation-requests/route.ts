import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const hackathonId = params.id;
    
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
    
    // Получаем заявки на участие
    const requests = await prisma.participationRequest.findMany({
      where: { hackathonId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Ошибка при получении заявок:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 