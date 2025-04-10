import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.settings.findMany();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось получить настройки" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();

    const setting = await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json(
      { error: "Не удалось сохранить настройки" },
      { status: 500 }
    );
  }
} 