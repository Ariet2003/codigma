import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const statsPage = parseInt(searchParams.get("statsPage") || "1");
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    const statsSkip = (statsPage - 1) * pageSize;

    // Общее количество заявок
    const totalRequests = await db.participationRequest.count();

    // Статистика по статусам
    const statusStats = await db.participationRequest.groupBy({
      by: ['status'],
      _count: {
        _all: true
      }
    });

    const statusMap = statusStats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = stat._count._all;
      return acc;
    }, {} as Record<string, number>);

    // Последние заявки с деталями
    const recentRequests = await db.participationRequest.findMany({
      select: {
        id: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        hackathon: {
          select: {
            title: true,
            startDate: true,
            endDate: true,
            isOpen: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: pageSize
    });

    // Статистика по закрытым хакатонам
    const closedHackathonsStats = await db.hackathon.findMany({
      where: {
        isOpen: false
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        applications: {
          select: {
            status: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      },
      skip: statsSkip,
      take: pageSize
    });

    // Подсчет общего количества закрытых хакатонов
    const totalClosedHackathons = await db.hackathon.count({
      where: {
        isOpen: false
      }
    });

    // Форматируем статистику по хакатонам
    const hackathonStats = closedHackathonsStats.map(hackathon => ({
      id: hackathon.id,
      title: hackathon.title,
      startDate: hackathon.startDate,
      endDate: hackathon.endDate,
      stats: {
        pending: hackathon.applications.filter(r => r.status === 'PENDING').length,
        approved: hackathon.applications.filter(r => r.status === 'APPROVED').length,
        rejected: hackathon.applications.filter(r => r.status === 'REJECTED').length,
        total: hackathon.applications.length
      }
    }));

    // Общее количество страниц
    const totalPages = Math.ceil(totalRequests / pageSize);
    const totalStatsPages = Math.ceil(totalClosedHackathons / pageSize);

    return NextResponse.json({
      totalRequests,
      statusStats: {
        pending: statusMap.pending || 0,
        approved: statusMap.approved || 0,
        rejected: statusMap.rejected || 0
      },
      recentRequests: recentRequests.map(req => ({
        id: req.id,
        status: req.status,
        createdAt: req.createdAt.toISOString(),
        userName: req.user.name,
        userEmail: req.user.email,
        hackathonTitle: req.hackathon.title,
        hackathonStartDate: req.hackathon.startDate,
        hackathonEndDate: req.hackathon.endDate,
        hackathonIsOpen: req.hackathon.isOpen
      })),
      hackathonStats,
      pagination: {
        currentPage: page,
        totalPages,
        pageSize
      },
      statsPagination: {
        currentPage: statsPage,
        totalPages: totalStatsPages,
        pageSize
      }
    });
  } catch (error) {
    console.error('Error fetching requests report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests report' },
      { status: 500 }
    );
  }
} 