"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Mail,
  Code,
  Users,
  Hash,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  totalScore: number;
  tasksCompleted: number;
  hackathonsParticipated: number;
  totalSubmissions: number;
}

interface PaginationData {
  total: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export default function RatingPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [sortBy, setSortBy] = useState('totalScore');
  const [order, setOrder] = useState('desc');
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pageSize: 200,
    currentPage: 1,
    totalPages: 1
  });

  useEffect(() => {
    fetchUsers();
  }, [sortBy, order, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `/api/rating?sortBy=${sortBy}&order=${order}&page=${pagination.currentPage}`
      );
      if (!response.ok) throw new Error('Ошибка загрузки данных');
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSort = (field: string) => {
    if (field === sortBy) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
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
            sortBy === field && (
              order === 'asc' 
                ? "text-[#4E7AFF] rotate-180 transition-transform" 
                : "text-[#4E7AFF] transition-transform"
            )
          )} 
        />
      </div>
    </Button>
  );

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return 'text-yellow-500';
      case 1:
        return 'text-gray-400';
      case 2:
        return 'text-amber-600';
      default:
        return 'text-gray-300';
    }
  };

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Показано {((pagination.currentPage - 1) * pagination.pageSize) + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} из {pagination.total}
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
                  <SortButton field="email">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
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
                  <SortButton field="totalSubmissions">
                    <Hash className="h-4 w-4 mr-1" />
                    Отправок
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
              {users.map((user, index) => {
                const globalIndex = (pagination.currentPage - 1) * pagination.pageSize + index;
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {globalIndex < 3 ? (
                          <Medal className={`h-5 w-5 ${getMedalColor(globalIndex)}`} />
                        ) : (
                          globalIndex + 1
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{user.name || 'Без имени'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {user.totalScore.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell>{user.tasksCompleted}</TableCell>
                    <TableCell>{user.totalSubmissions}</TableCell>
                    <TableCell>{user.hackathonsParticipated}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <PaginationControls />
        </CardContent>
      </Card>
    </div>
  );
} 