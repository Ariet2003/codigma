import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Submission {
  taskId: string;
  executionTime: bigint;
  memory: bigint;
  createdAt: Date;
  task: {
    difficulty: string;
  }
}

interface Participant {
  userId: string;
  submissions: Submission[];
}

interface Hackathon {
  id: string;
  participants: Participant[];
}

// Функция для получения константы сложности
const getDifficultyConstant = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 1000000;
    case 'medium': return 2000000;
    case 'hard': return 3000000;
    default: return 1000000;
  }
};

export async function GET() {
  try {
    // Получаем все завершенные хакатоны, которые еще не обработаны
    const completedHackathons = await prisma.hackathon.findMany({
      where: {
        endDate: {
          lt: new Date() // Завершенные хакатоны
        },
        // @ts-ignore - игнорируем ошибку для поля isScoresProcessed
        isScoresProcessed: false
      },
      include: {
        participants: {
          include: {
            user: true,
            submissions: {
              where: {
                status: 'ACCEPTED'
              },
              include: {
                task: {
                  select: {
                    difficulty: true
                  }
                }
              }
            }
          }
        }
      }
    }) as unknown as Hackathon[];

    for (const hackathon of completedHackathons) {
      // Обрабатываем каждого участника
      for (const participant of hackathon.participants) {
        // Получаем уникальные решенные задачи
        const uniqueSolvedTasks = new Map<string, Submission>();
        
        // Находим лучшее решение для каждой задачи
        participant.submissions.forEach((submission: Submission) => {
          const taskId = submission.taskId;
          if (!uniqueSolvedTasks.has(taskId) || 
              submission.createdAt > uniqueSolvedTasks.get(taskId)!.createdAt) {
            uniqueSolvedTasks.set(taskId, submission);
          }
        });

        // Считаем баллы
        let totalScore = 0;
        uniqueSolvedTasks.forEach((submission: Submission) => {
          const t = Number(submission.executionTime) || 0;
          const m = Number(submission.memory) || 0;
          if (t > 0 && m > 0) {
            const C = getDifficultyConstant(submission.task.difficulty);
            totalScore += Math.log10(C) - Math.log10(Math.sqrt(t * m));
          }
        });

        const finalScore = Math.max(0, totalScore);

        // Обновляем баллы пользователя
        await prisma.user.update({
          where: { id: participant.userId },
          data: {
            totalScore: {
              increment: finalScore
            }
          }
        });
      }

      // Помечаем хакатон как обработанный
      await prisma.hackathon.update({
        where: { id: hackathon.id },
        data: {
          // @ts-ignore - игнорируем ошибку для поля isScoresProcessed
          isScoresProcessed: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      processedHackathons: completedHackathons.length
    });
  } catch (error) {
    console.error("[UPDATE_USER_SCORES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 