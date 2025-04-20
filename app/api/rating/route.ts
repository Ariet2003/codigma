import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE = 100;

export type SortType = 'score' | 'tasks' | 'hackathons';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const sortBy = (searchParams.get("sortBy") || 'score') as SortType;

    // Определяем порядок сортировки в зависимости от выбранного типа
    const orderBy = {
      score: [
        { totalScore: "desc" as const },
        { tasksCompleted: "desc" as const },
        { hackathonsParticipated: "desc" as const },
        { name: "asc" as const }
      ],
      tasks: [
        { tasksCompleted: "desc" as const },
        { totalScore: "desc" as const },
        { hackathonsParticipated: "desc" as const },
        { name: "asc" as const }
      ],
      hackathons: [
        { hackathonsParticipated: "desc" as const },
        { totalScore: "desc" as const },
        { tasksCompleted: "desc" as const },
        { name: "asc" as const }
      ]
    }[sortBy];

    // Базовый запрос для подсчета общего количества пользователей
    const baseWhereClause = search
      ? {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {};

    // Получаем общее количество пользователей
    const totalUsers = await prisma.user.count({
      where: baseWhereClause,
    });

    // Получаем позицию текущего пользователя
    let currentUserPosition = null;
    let currentUserPage = null;
    
    if (session?.user?.email) {
      const usersAbove = await prisma.user.count({
        where: {
          [sortBy === 'score' ? 'totalScore' : 
           sortBy === 'tasks' ? 'tasksCompleted' : 
           'hackathonsParticipated']: {
            gt: session.user[sortBy === 'score' ? 'totalScore' : 
                           sortBy === 'tasks' ? 'tasksCompleted' : 
                           'hackathonsParticipated'] || 0,
          },
        },
      });
      currentUserPosition = usersAbove + 1;
      currentUserPage = Math.ceil(currentUserPosition / ITEMS_PER_PAGE);
    }

    // Получаем всех пользователей для определения их реальных позиций
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        totalScore: true,
        tasksCompleted: true,
        hackathonsParticipated: true,
        name: true,
      },
      orderBy,
    });

    // Создаем карту позиций
    const positionMap = new Map();
    let position = 1;

    // Теперь каждый пользователь получает уникальную позицию
    for (const user of allUsers) {
      positionMap.set(user.id, position);
      position++;
    }

    // Получаем пользователей для текущей страницы
    const users = await prisma.user.findMany({
      where: baseWhereClause,
      select: {
        id: true,
        name: true,
        image: true,
        totalScore: true,
        tasksCompleted: true,
        hackathonsParticipated: true,
      },
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    });

    // Добавляем реальные позиции к пользователям
    const usersWithPositions = users.map(user => ({
      ...user,
      position: positionMap.get(user.id) || 0
    }));

    return NextResponse.json({
      users: usersWithPositions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / ITEMS_PER_PAGE),
        totalUsers,
        currentUserPosition,
        currentUserPage,
      },
      currentSort: sortBy,
    });
  } catch (error) {
    console.error("Error in rating API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 