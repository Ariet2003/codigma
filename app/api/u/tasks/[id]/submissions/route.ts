import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new NextResponse('UserId is required', { status: 400 });
    }

    // Проверяем, что пользователь запрашивает свои собственные решения
    if (userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const submissions = await prisma.userTaskSubmission.findMany({
      where: {
        taskId: params.id,
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        status: true,
        language: true,
        memory: true,
        executionTime: true,
        testsPassed: true,
        testsTotal: true,
        createdAt: true
      }
    });

    // Преобразуем BigInt в число перед отправкой
    const formattedSubmissions = submissions.map(submission => ({
      ...submission,
      executionTime: submission.executionTime ? Number(submission.executionTime) : null,
      memory: submission.memory ? Number(submission.memory) : null,
      createdAt: submission.createdAt.toISOString()
    }));

    return NextResponse.json(formattedSubmissions);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 