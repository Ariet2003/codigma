import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    const requests = await prisma.participationRequest.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        hackathon: {
          select: {
            title: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("[HACKATHON_REQUESTS]", error);
    return NextResponse.json(
      { error: "Произошла внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 