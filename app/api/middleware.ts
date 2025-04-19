import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Функция для получения константы сложности
const getDifficultyConstant = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 1000000;
    case 'medium': return 2000000;
    case 'hard': return 3000000;
    default: return 1000000;
  }
};

// Функция для обновления баллов пользователей завершенного хакатона
export async function updateHackathonScores(hackathonId: string) {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
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
    });

    if (!hackathon) return;

    // Обрабатываем каждого участника
    for (const participant of hackathon.participants) {
      // Получаем уникальные решенные задачи
      const uniqueSolvedTasks = new Map();
      
      // Находим лучшее решение для каждой задачи
      participant.submissions.forEach(submission => {
        const taskId = submission.taskId;
        if (!uniqueSolvedTasks.has(taskId) || 
            submission.createdAt > uniqueSolvedTasks.get(taskId).createdAt) {
          uniqueSolvedTasks.set(taskId, submission);
        }
      });

      // Считаем баллы
      let totalScore = 0;
      uniqueSolvedTasks.forEach(submission => {
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
          },
          hackathonsParticipated: {
            increment: 1
          }
        }
      });
    }
  } catch (error) {
    console.error("[UPDATE_HACKATHON_SCORES]", error);
  }
} 