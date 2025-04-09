import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // Общее количество решений
    const totalSubmissions = await db.taskSubmission.count();

    // Статистика по статусам
    const statusStats = await db.taskSubmission.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Статистика по памяти и времени выполнения
    const performanceStats = await db.taskSubmission.aggregate({
      _min: {
        memory: true,
        executionTime: true
      },
      _max: {
        memory: true,
        executionTime: true
      },
      _avg: {
        memory: true,
        executionTime: true
      },
      where: {
        AND: [
          {
            status: {
              in: ['ACCEPTED', 'REJECTED']
            }
          },
          {
            memory: {
              gt: 0,
              not: null
            }
          },
          {
            executionTime: {
              gt: 0,
              not: null
            }
          }
        ]
      }
    });

    // Статистика по тестам
    const testStats = await db.taskSubmission.aggregate({
      _avg: {
        testsPassed: true,
        testsTotal: true
      },
      where: {
        status: {
          in: ['ACCEPTED', 'REJECTED']
        }
      }
    });

    const avgTestsPassedPercent = testStats._avg.testsPassed && testStats._avg.testsTotal
      ? (testStats._avg.testsPassed / testStats._avg.testsTotal * 100)
      : 0;

    // Последние решения с деталями
    const recentSubmissions = await db.taskSubmission.findMany({
      select: {
        id: true,
        status: true,
        testsPassed: true,
        testsTotal: true,
        memory: true,
        executionTime: true,
        language: true,
        createdAt: true,
        task: {
          select: {
            title: true,
            difficulty: true
          }
        },
        participant: {
          select: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        hackathon: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: pageSize
    });

    // Общее количество записей для пагинации
    const totalRecords = await db.taskSubmission.count();

    // Форматируем статистику по статусам
    const statusMap = statusStats.reduce((acc, curr) => {
      acc[curr.status.toLowerCase()] = Number(curr._count.id);
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalSubmissions: Number(totalSubmissions),
      statusStats: {
        pending: statusMap.pending || 0,
        processing: statusMap.processing || 0,
        accepted: statusMap.accepted || 0,
        rejected: statusMap.rejected || 0,
        error: statusMap.error || 0
      },
      performanceStats: {
        testsPassedPercent: avgTestsPassedPercent,
        memory: {
          min: Number(performanceStats._min?.memory) || 0,
          max: Number(performanceStats._max?.memory) || 0,
          average: Number(performanceStats._avg?.memory) || 0
        },
        executionTime: {
          min: Number(performanceStats._min?.executionTime) || 0,
          max: Number(performanceStats._max?.executionTime) || 0,
          average: Number(performanceStats._avg?.executionTime) || 0
        }
      },
      recentSubmissions: recentSubmissions.map(sub => ({
        id: sub.id,
        status: sub.status,
        testsPassed: sub.testsPassed,
        testsTotal: sub.testsTotal,
        passedPercent: sub.testsTotal > 0 ? (sub.testsPassed / sub.testsTotal * 100) : 0,
        memory: sub.memory ? Number(sub.memory) : 0,
        executionTime: sub.executionTime ? Number(sub.executionTime) : 0,
        language: sub.language,
        createdAt: sub.createdAt.toISOString(),
        taskTitle: sub.task.title,
        taskDifficulty: sub.task.difficulty,
        userName: sub.participant.user.name,
        hackathonTitle: sub.hackathon?.title || null
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRecords / pageSize),
        pageSize
      }
    });
  } catch (error) {
    console.error('Error fetching submissions report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions report' },
      { status: 500 }
    );
  }
} 