"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  CheckCircle2,
  XCircle,
  Circle,
  ArrowUpDown,
  Gauge,
  Filter,
  SortAsc
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

type Task = {
  id: string;
  title: string;
  difficulty: string;
  solved: boolean;
  attempts: number;
  acceptedCount: number;
  category: string;
  rating: number;
};

type TaskStats = {
  total: number;
  solved: number;
  byDifficulty: {
    easy: { total: number; solved: number };
    medium: { total: number; solved: number };
    hard: { total: number; solved: number };
  };
  submissionDates: string[];
};

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'title');
  const [order, setOrder] = useState(searchParams.get('order') || 'asc');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    solved: 0,
    byDifficulty: {
      easy: { total: 0, solved: 0 },
      medium: { total: 0, solved: 0 },
      hard: { total: 0, solved: 0 }
    },
    submissionDates: []
  });
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (difficulty !== 'all') params.set('difficulty', difficulty);
    if (status !== 'all') params.set('status', status);
    if (sortBy !== 'title') params.set('sortBy', sortBy);
    if (order !== 'asc') params.set('order', order);
    if (page > 1) params.set('page', page.toString());

    router.push(`/u/tasks?${params.toString()}`, { scroll: false });
  }, [search, difficulty, status, sortBy, order, page]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        ...(search && { search }),
        ...(difficulty !== 'all' && { difficulty }),
        ...(status !== 'all' && { status }),
        sortBy,
        order
      });

      const response = await fetch(`/api/tasks?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data = await response.json();
      setTasks(data.tasks || []);
      setTotalPages(data.pages || 1);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error('Error:', error);
      setTasks([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/tasks/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [page, search, difficulty, status, sortBy, order]);

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value);
    setPage(1);
    (document.activeElement as HTMLElement)?.blur();
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
    (document.activeElement as HTMLElement)?.blur();
  };

  const handleSort = (value: string) => {
    if (sortBy === value) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(value);
      setOrder('asc');
    }
    setPage(1);
    (document.activeElement as HTMLElement)?.blur();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500/10 text-green-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500';
      case 'hard': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusBadge = (solved: boolean) => {
    if (solved) {
      return (
        <div className="flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-green-500 transition-transform duration-300 group-hover:scale-110" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center">
        <Circle className="w-5 h-5 text-muted-foreground/50 transition-transform duration-300 group-hover:scale-110" />
      </div>
    );
  };

  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let firstDayOffset = firstDay.getDay() - 1;
    if (firstDayOffset === -1) firstDayOffset = 6;

    const days = [];
    for (let i = 0; i < firstDayOffset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="container py-6 space-y-6">
        <div className="relative bg-background/50 backdrop-blur-sm border rounded-xl shadow-md">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" />
          <div className="relative p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1 max-w-sm">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/80 w-5 h-5 transition-colors group-hover:text-primary" />
                  <Input
                    placeholder="Поиск задач..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11 bg-background/80 border-muted/50 transition-all duration-300 hover:border-primary/50 focus:border-primary focus:bg-background w-full"
                  />
                </div>
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select value={difficulty} onValueChange={handleDifficultyChange}>
                        <SelectTrigger className="w-[180px] h-11 bg-background/80 border-muted/50 transition-all duration-300 hover:border-primary/50 hover:bg-background focus:bg-background shadow-sm hover:shadow-md">
                          <div className="flex items-center">
                            <Gauge className="w-5 h-5 mr-2.5 text-primary/70 flex-shrink-0" />
                            <SelectValue placeholder="Сложность" />
                          </div>
                        </SelectTrigger>
                        <SelectContent align="start" sideOffset={5} className="bg-background/95 border-primary/20 shadow-xl">
                          <SelectItem value="all">Все уровни</SelectItem>
                          <SelectItem value="easy">Легкие</SelectItem>
                          <SelectItem value="medium">Средние</SelectItem>
                          <SelectItem value="hard">Сложные</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    align="start"
                    className="z-50 bg-background/95 border-primary/20 shadow-md px-3 py-1.5 text-sm"
                  >
                    <p>Фильтр по уровню сложности задач</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select value={status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px] h-11 bg-background/80 border-muted/50 transition-all duration-300 hover:border-primary/50 hover:bg-background focus:bg-background shadow-sm hover:shadow-md">
                          <div className="flex items-center">
                            <Filter className="w-5 h-5 mr-2.5 text-primary/70 flex-shrink-0" />
                            <SelectValue placeholder="Статус" />
                          </div>
                        </SelectTrigger>
                        <SelectContent align="start" sideOffset={5} className="bg-background/95 border-primary/20 shadow-xl">
                          <SelectItem value="all">Все статусы</SelectItem>
                          <SelectItem value="solved">Решено</SelectItem>
                          <SelectItem value="unsolved">Не решено</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    align="start"
                    className="z-50 bg-background/95 border-primary/20 shadow-md px-3 py-1.5 text-sm"
                  >
                    <p>Фильтр по статусу решения</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select value={sortBy} onValueChange={handleSort}>
                        <SelectTrigger className="w-[180px] h-11 bg-background/80 border-muted/50 transition-all duration-300 hover:border-primary/50 hover:bg-background focus:bg-background shadow-sm hover:shadow-md">
                          <div className="flex items-center">
                            <SortAsc className="w-5 h-5 mr-2.5 text-primary/70 flex-shrink-0" />
                            <SelectValue placeholder="Сортировка" />
                          </div>
                        </SelectTrigger>
                        <SelectContent align="start" sideOffset={5} className="bg-background/95 border-primary/20 shadow-xl">
                          <SelectItem value="title">По названию</SelectItem>
                          <SelectItem value="difficulty">По сложности</SelectItem>
                          <SelectItem value="solved">По решениям</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    align="start"
                    className="z-50 bg-background/95 border-primary/20 shadow-md px-3 py-1.5 text-sm"
                  >
                    <p>Сортировка задач</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                Задачи не найдены
              </div>
            ) : (
              <div className="relative bg-background/50 rounded-xl overflow-hidden backdrop-blur-sm border shadow-md">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5 hover:bg-primary/10 transition-colors">
                      <TableHead className="w-[8%] font-semibold text-primary text-center">Статус</TableHead>
                      <TableHead className="w-[52%] font-semibold text-primary">Название</TableHead>
                      <TableHead className="w-[20%] font-semibold text-primary">Сложность</TableHead>
                      <TableHead className="w-[10%] text-right font-semibold text-primary">Решили</TableHead>
                      <TableHead className="w-[10%] text-right font-semibold text-primary">Попытки</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task, index) => (
                      <TableRow
                        key={task.id}
                        className={cn(
                          "group transition-all duration-300",
                          index % 2 === 0 
                            ? "bg-background/80 hover:bg-primary/5" 
                            : "bg-muted/30 hover:bg-primary/5",
                          "hover:shadow-md hover:-translate-y-[1px]",
                          "cursor-pointer"
                        )}
                        onClick={() => router.push(`/u/tasks/${task.id}`)}
                      >
                        <TableCell className="text-center">{getStatusBadge(task.solved)}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                            <span>{task.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "font-medium transition-all duration-300",
                              getDifficultyColor(task.difficulty),
                              "group-hover:shadow-[0_2px_10px_-2px_rgba(0,0,0,0.1)] group-hover:translate-y-[-1px]"
                            )}
                          >
                            {task.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium text-muted-foreground/90 group-hover:text-primary transition-colors">
                            {task.acceptedCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center justify-end gap-1.5 font-medium text-muted-foreground/90 group-hover:text-primary transition-colors">
                            <span>{task.attempts || 0}</span>
                            {task.attempts > 0 && (
                              <span className="text-xs text-muted-foreground/70">
                                {task.solved ? "✓" : ""}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Всего задач: {totalItems}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="shadow-none hover:shadow-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-sm">
                  Страница {page} из {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="shadow-none hover:shadow-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative bg-card backdrop-blur-sm border rounded-xl shadow-md h-fit">
              <div className="relative p-6 space-y-6">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-semibold">Статистика решений</h3>
                </div>
                <div className="relative flex justify-center">
                  <div className="w-32 h-32 rounded-full border-8 border-muted relative">
                    <div 
                      className="absolute inset-0 rounded-full border-8 border-primary"
                      style={{
                        clipPath: `polygon(50% 50%, -50% -50%, ${stats.solved / stats.total * 360}deg, 50% 50%)`
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats.solved}</div>
                        <div className="text-xs text-muted-foreground">из {stats.total}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-500">Легкие</span>
                      <span className="text-green-500">{stats.byDifficulty.easy.solved}/{stats.byDifficulty.easy.total}</span>
                    </div>
                    <Progress 
                      value={(stats.byDifficulty.easy.solved / stats.byDifficulty.easy.total) * 100} 
                      className="h-2 bg-green-500/20 [&>div]:bg-green-500" 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-500">Средние</span>
                      <span className="text-yellow-500">{stats.byDifficulty.medium.solved}/{stats.byDifficulty.medium.total}</span>
                    </div>
                    <Progress 
                      value={(stats.byDifficulty.medium.solved / stats.byDifficulty.medium.total) * 100} 
                      className="h-2 bg-yellow-500/20 [&>div]:bg-yellow-500" 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-red-500">Сложные</span>
                      <span className="text-red-500">{stats.byDifficulty.hard.solved}/{stats.byDifficulty.hard.total}</span>
                    </div>
                    <Progress 
                      value={(stats.byDifficulty.hard.solved / stats.byDifficulty.hard.total) * 100} 
                      className="h-2 bg-red-500/20 [&>div]:bg-red-500" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative bg-card backdrop-blur-sm border rounded-xl shadow-md h-fit">
              <div className="relative p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-semibold">Календарь активности</h3>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevMonth}
                    className="hover:bg-primary/10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <span className="text-sm font-medium">
                    {currentDate.toLocaleString('ru', { 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextMonth}
                    className="hover:bg-primary/10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                    <div key={day} className="text-center text-xs text-muted-foreground py-1">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentDate).map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} className="aspect-square" />;
                    
                    const dayNumber = date.getDate();
                    const dateStr = date.toISOString().split('T')[0];
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const hasSubmission = stats.submissionDates.includes(dateStr);
                    const isToday = today.toISOString().split('T')[0] === dateStr;
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    
                    return (
                      <div
                        key={dateStr}
                        className={cn(
                          "relative flex items-center justify-center",
                          "aspect-square rounded-md text-xs",
                          "transition-all duration-200",
                          isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                          hasSubmission 
                            ? "bg-green-500 hover:bg-green-600 text-primary-foreground" 
                            : "bg-muted/50 hover:bg-muted border border-border",
                          !isCurrentMonth && "opacity-50"
                        )}
                        title={`${date.toLocaleDateString('ru', { 
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        })}: ${hasSubmission ? 'Есть решения' : 'Нет решений'}`}
                      >
                        {dayNumber}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-3 text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-md bg-muted/50 border border-border" />
                    <span>Нет решений</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-md bg-green-500" />
                    <span>Есть решения</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
} 