"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Trophy,
  Medal,
  Star,
  ArrowUpDown,
  Code,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SortType } from "@/app/api/rating/route";

interface User {
  id: string;
  name: string | null;
  image: string | null;
  totalScore: number;
  tasksCompleted: number;
  hackathonsParticipated: number;
  position: number;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  pageSize: number;
}

export default function RatingPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [sortBy, setSortBy] = useState<SortType>('score');
  const [order, setOrder] = useState('desc');
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    pageSize: 10
  });

  useEffect(() => {
    fetchUsers();
  }, [sortBy, order, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `/api/rating?page=${pagination.currentPage}&sortBy=${sortBy}`
      );
      if (!response.ok) throw new Error('Ошибка загрузки данных');
      const data = await response.json();
      console.log('Received data:', data);
      setUsers(data.users);
      setPagination(prev => ({
        ...prev,
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
        totalUsers: data.pagination.totalUsers,
        pageSize: data.pagination.pageSize || 100
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSort = (field: string) => {
    let newSortBy: SortType = 'score';
    switch (field) {
      case 'totalScore':
        newSortBy = 'score';
        break;
      case 'tasksCompleted':
        newSortBy = 'tasks';
        break;
      case 'hackathonsParticipated':
        newSortBy = 'hackathons';
        break;
      default:
        newSortBy = 'score';
    }
    setSortBy(newSortBy);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-8 flex items-center gap-1 font-medium"
    >
      {children}
      <div className="flex flex-col h-4 justify-center">
        <ArrowUpDown 
          className={cn(
            "h-4 w-4",
            (field === 'totalScore' && sortBy === 'score') ||
            (field === 'tasksCompleted' && sortBy === 'tasks') ||
            (field === 'hackathonsParticipated' && sortBy === 'hackathons')
              ? "text-[#4E7AFF]"
              : ""
          )} 
        />
      </div>
    </Button>
  );

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-gray-300';
    }
  };

  const PaginationControls = () => {
    const startItem = users.length > 0 ? ((pagination.currentPage - 1) * pagination.pageSize) + 1 : 0;
    const endItem = Math.min(startItem + users.length - 1, pagination.totalUsers);

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {users.length > 0 ? (
              `Показано ${startItem} - ${endItem} из ${pagination.totalUsers}`
            ) : (
              "Нет данных"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(1)}
            disabled={pagination.currentPage === 1}
            className="h-8 w-8"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Страница {pagination.currentPage} из {pagination.totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="h-8 w-8"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="animate-pulse-slow bg-[#4E7AFF]/10 p-2 rounded-lg">
            <TrendingUp className="w-6 h-6 text-[#4E7AFF]" />
          </div>
          <h1 className="text-2xl font-bold text-[#4E7AFF]">Общий рейтинг</h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>
                  <SortButton field="name">
                    Участник
                  </SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="totalScore">
                    <Trophy className="h-4 w-4 mr-1" />
                    Общий балл
                  </SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="tasksCompleted">
                    <Code className="h-4 w-4 mr-1" />
                    Решено задач
                  </SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="hackathonsParticipated">
                    <Users className="h-4 w-4 mr-1" />
                    Хакатонов
                  </SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {user.position <= 3 ? (
                        <Medal className={`h-5 w-5 ${getMedalColor(user.position)}`} />
                      ) : (
                        user.position
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        {user.image ? (
                          <AvatarImage src={user.image} />
                        ) : (
                          <AvatarFallback>
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{user.name || 'Без имени'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {user.totalScore.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>{user.tasksCompleted}</TableCell>
                  <TableCell>{user.hackathonsParticipated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls />
        </CardContent>
      </Card>
    </div>
  );
} 