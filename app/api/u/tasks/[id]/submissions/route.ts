import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const submissions = await prisma.userTaskSubmission.findMany({
      where: {
        taskId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
        language: true,
        memory: true,
        executionTime: true,
        code: true,
        testsPassed: true,
        testsTotal: true,
      },
    });

    // Преобразуем BigInt в строку для JSON
    const formattedSubmissions = submissions.map(submission => ({
      ...submission,
      memory: submission.memory ? Number(submission.memory) : null,
      executionTime: submission.executionTime ? Number(submission.executionTime) : null,
      createdAt: submission.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedSubmissions);
  } catch (error) {
    console.error('[SUBMISSIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 