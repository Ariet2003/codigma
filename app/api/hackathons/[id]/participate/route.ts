import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
      include: {
        participants: {
          where: { userId: session.user.id }
        }
      }
    });

    if (!hackathon) {
      return new NextResponse("Хакатон не найден", { status: 404 });
    }

    if (!hackathon.isOpen) {
      return new NextResponse("Хакатон закрыт для регистрации", { status: 403 });
    }

    if (new Date() >= new Date(hackathon.startDate)) {
      return new NextResponse("Хакатон уже начался", { status: 403 });
    }

    if (hackathon.participants.length > 0) {
      return new NextResponse("Вы уже участвуете в этом хакатоне", { status: 400 });
    }

    // Добавляем пользователя в участники
    const participant = await prisma.hackathonParticipant.create({
      data: {
        hackathonId: params.id,
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[HACKATHON_PARTICIPATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 