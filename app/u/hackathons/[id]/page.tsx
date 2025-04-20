"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Trophy,
  Calendar,
  Users,
  ArrowLeft,
  Clock,
  FileText,
  BarChart,
  Info,
  Medal,
  CheckCircle2,
  XCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Task = {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status?: 'NOT_STARTED' | 'ACCEPTED' | 'REJECTED';
};

type Participant = {
  id: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  solvedTasks: number;
  score: number;
};

type Hackathon = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  isParticipating: boolean;
  participantsCount: number;
  solvedTasksCount: number;
  totalTasksCount: number;
  currentRating: number;
  totalParticipants: number;
  averageExecutionTime: number;
  averageMemoryUsage: number;
  participants: Participant[];
  tasks: string[];
  currentUserId?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalParticipants: number;
    currentUserPosition?: number;
    currentUserPage?: number;
  };
  submissionsCount: number;
  acceptedSubmissionsCount: number;
};

function CountdownTimer({ targetDate, className }: { targetDate: string, className?: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Clock className="w-5 h-5 text-primary" />
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="flex flex-col">
          <span className="text-2xl font-bold tabular-nums">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">дней</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold tabular-nums">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">часов</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold tabular-nums">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">минут</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold tabular-nums">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">секунд</span>
        </div>
      </div>
    </div>
  );
}

export default function HackathonPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'tasks' | 'rating'>('description');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const response = await fetch(`/api/hackathons/${params.id}?page=${currentPage}`);
        if (!response.ok) throw new Error('Failed to fetch hackathon');
        const data = await response.json();
        console.log('Hackathon Data:', {
          currentUserId: data.currentUserId,
          participants: data.participants.map((p: { user: { id: string; name: string } }) => ({
            userId: p.user.id,
            name: p.user.name
          }))
        });
        setHackathon(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error("Не удалось загрузить информацию о хакатоне");
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();
  }, [params.id, currentPage]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!hackathon || !hackathon.tasks || activeTab !== 'tasks') return;
      
      setLoadingTasks(true);
      try {
        const response = await fetch(`/api/tasks?ids=${hackathon.tasks.join(',')}&hackathonId=${hackathon.id}`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setTasks(data.tasks);
      } catch (error) {
        console.error('Error:', error);
        toast.error("Не удалось загрузить задачи");
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [hackathon, activeTab]);

  const handleParticipate = async () => {
    if (!hackathon) return;
    
    try {
      setParticipating(true);
      const response = await fetch(`/api/hackathons/${hackathon.id}/participate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      // Обновляем данные хакатона после успешного участия
      const updatedHackathon = {
        ...hackathon,
        isParticipating: true,
        participantsCount: hackathon.participantsCount + 1
      };
      setHackathon(updatedHackathon);

      // Показываем уведомление об успешной регистрации
      toast.success("Вы успешно зарегистрировались на хакатон");

      // Перенаправляем на список хакатонов
      setTimeout(() => {
        router.push("/u/hackathons");
      }, 1500);

    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Не удалось зарегистрироваться на хакатон");
    } finally {
      setParticipating(false);
    }
  };

  const isHackathonActive = (hackathon: Hackathon) => {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    const endDate = new Date(hackathon.endDate);
    return now >= startDate && now <= endDate;
  };

  const isHackathonUpcoming = (hackathon: Hackathon) => {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    return now < startDate;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Хакатон не найден</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container py-8 space-y-8">
        {/* Верхняя панель с кнопкой назад */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="group flex items-center gap-2 rounded-lg border bg-gradient-to-r from-background to-background/80 px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:border-primary/20 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:text-primary hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Назад к списку
          </Button>
        </div>

        {/* Основной контент */}
        <div className="space-y-8">
          {/* Информация о хакатоне */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-muted/50 via-background to-background/80 p-8">
            <div className="absolute right-0 top-0 opacity-[0.15] transform translate-x-1/4 -translate-y-1/4">
              <Trophy className="w-72 h-72 text-primary rotate-12" />
            </div>
            <div className="relative space-y-6">
              <div className="flex items-start justify-between gap-8">
                <div className="space-y-4 flex-1">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground/90">
                    {hackathon.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>
                        {format(new Date(hackathon.startDate), "dd MMM yyyy HH:mm", { locale: ru })}
                        {" - "}
                        {format(new Date(hackathon.endDate), "dd MMM yyyy HH:mm", { locale: ru })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{hackathon.participantsCount} участников</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={hackathon.isOpen ? "default" : "secondary"} className="px-3 py-1">
                        {hackathon.isOpen ? "Открытый" : "Закрытый"}
                      </Badge>
                      {isHackathonUpcoming(hackathon) ? (
                        <Badge className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          Предстоит
                        </Badge>
                      ) : isHackathonActive(hackathon) ? (
                        <Badge className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20">
                          Активный
                        </Badge>
                      ) : (
                        <Badge className="px-3 py-1 bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                          Завершен
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {isHackathonUpcoming(hackathon) && !hackathon.isParticipating && hackathon.isOpen && (
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
                    onClick={handleParticipate}
                    disabled={participating}
                  >
                    {participating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Регистрация...
                      </div>
                    ) : (
                      <>
                        <Trophy className="w-5 h-5" />
                        Участвовать
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Таймер */}
              {(isHackathonUpcoming(hackathon) || isHackathonActive(hackathon)) && (
                <div className="flex items-center justify-between rounded-xl border bg-card/50 backdrop-blur-sm p-6">
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-medium">
                      {isHackathonUpcoming(hackathon) ? "До начала хакатона" : "До завершения хакатона"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isHackathonUpcoming(hackathon) 
                        ? "Успейте зарегистрироваться!" 
                        : "Торопитесь завершить задания"}
                    </p>
                  </div>
                  <CountdownTimer 
                    targetDate={isHackathonUpcoming(hackathon) 
                      ? hackathon.startDate 
                      : hackathon.endDate
                    }
                    className="bg-background/40 backdrop-blur-sm rounded-lg px-6 py-3" 
                  />
                </div>
              )}

              {/* Добавляем блок статистики и навигации для активных участников */}
              {hackathon.isParticipating && isHackathonActive(hackathon) && (
                <div className="space-y-6">
                  {/* Статистика */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-primary/10">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        Решено задач
                      </div>
                      <div className="text-2xl font-semibold mt-1">
                        {hackathon.solvedTasksCount} / {hackathon.totalTasksCount}
                      </div>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-primary/10">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Trophy className="w-4 h-4 text-primary" />
                        Баллы
                      </div>
                      <div className="text-2xl font-semibold mt-1">
                        {hackathon.currentRating.toFixed(3)}
                      </div>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-primary/10">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Send className="w-4 h-4 text-primary" />
                        Количество отправок
                      </div>
                      <div className="text-2xl font-semibold mt-1">
                        {hackathon.submissionsCount}
                      </div>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-primary/10">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckSquare className="w-4 h-4 text-primary" />
                        Правильных отправок
                      </div>
                      <div className="text-2xl font-semibold mt-1">
                        {hackathon.acceptedSubmissionsCount}
                      </div>
                    </div>
                  </div>

                  {/* Навигационные кнопки */}
                  <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg">
                    <Button
                      variant="ghost"
                      className="flex-1 h-11 gap-2 rounded-md hover:bg-background hover:text-foreground data-[active=true]:bg-background data-[active=true]:text-foreground"
                      onClick={() => setActiveTab('description')}
                      data-active={activeTab === 'description'}
                    >
                      <Info className="w-4 h-4" />
                      Описание
                    </Button>

                    <Button
                      variant="ghost"
                      className="flex-1 h-11 gap-2 rounded-md hover:bg-background hover:text-foreground data-[active=true]:bg-background data-[active=true]:text-foreground"
                      onClick={() => setActiveTab('tasks')}
                      data-active={activeTab === 'tasks'}
                    >
                      <FileText className="w-4 h-4" />
                      Задачи
                    </Button>

                    <Button
                      variant="ghost"
                      className="flex-1 h-11 gap-2 rounded-md hover:bg-background hover:text-foreground data-[active=true]:bg-background data-[active=true]:text-foreground"
                      onClick={() => setActiveTab('rating')}
                      data-active={activeTab === 'rating'}
                    >
                      <BarChart className="w-4 h-4" />
                      Рейтинг
                    </Button>
                  </div>

                  {/* Контент вкладок */}
                  {activeTab === 'description' && (
                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                      <Markdown>{hackathon.description}</Markdown>
                    </div>
                  )}

                  {activeTab === 'tasks' && (
                    <div className="space-y-4">
                      {loadingTasks ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <div className="rounded-lg border bg-card">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[100px]">Статус</TableHead>
                                <TableHead>Название</TableHead>
                                <TableHead className="w-[150px]">Сложность</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tasks.map((task) => (
                                <TableRow
                                  key={task.id}
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() => router.push(`/u/hackathons/${hackathon.id}/tasks/${task.id}`)}
                                >
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {task.status === 'ACCEPTED' ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                      ) : task.status === 'REJECTED' ? (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                      ) : (
                                        <Circle className="w-5 h-5 text-muted-foreground" />
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">{task.title}</TableCell>
                                  <TableCell>
                                    <Badge
                                      className={cn(
                                        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                                        task.difficulty === 'easy' && "bg-green-500/10 text-green-500",
                                        task.difficulty === 'medium' && "bg-yellow-500/10 text-yellow-500",
                                        task.difficulty === 'hard' && "bg-red-500/10 text-red-500"
                                      )}
                                    >
                                      {task.difficulty === 'easy' ? 'Легкая' :
                                       task.difficulty === 'medium' ? 'Средняя' : 'Сложная'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'rating' && (
                    <div className="space-y-4">
                      {/* Кнопка "Найти меня" */}
                      {hackathon.pagination?.currentUserPosition && (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => {
                              if (hackathon.pagination?.currentUserPage) {
                                setCurrentPage(hackathon.pagination.currentUserPage);
                              }
                            }}
                          >
                            <Users className="w-4 h-4" />
                            Найти меня
                          </Button>
                        </div>
                      )}

                      <div className="grid gap-4">
                        {hackathon.participants && hackathon.participants.map((participant, index) => {
                          console.log('Current User ID:', hackathon.currentUserId);
                          console.log('Participant User ID:', participant.user.id);
                          console.log('Is Current User:', participant.user.id === hackathon.currentUserId);
                          
                          return (
                            <div
                              key={participant.id}
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-primary/10 transition-all duration-300",
                                participant.user.id === hackathon.currentUserId && 
                                "bg-primary/10 border-primary border-2 shadow-[0_0_15px_rgba(var(--primary),.15)] relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/10 before:to-transparent before:rounded-lg before:-z-10"
                              )}
                            >
                              {/* Место */}
                              <div className="flex items-center justify-center w-8">
                                <span className={cn(
                                  "text-lg font-medium",
                                  participant.user.id === hackathon.currentUserId 
                                    ? "text-primary font-bold"
                                    : "text-muted-foreground",
                                  ((currentPage - 1) * 100) + index + 1 === 1 && "text-yellow-500 text-2xl",
                                  ((currentPage - 1) * 100) + index + 1 === 2 && "text-zinc-400 text-xl",
                                  ((currentPage - 1) * 100) + index + 1 === 3 && "text-amber-600 text-xl"
                                )}>
                                  {((currentPage - 1) * 100) + index + 1 === 1 ? (
                                    <Medal className="w-6 h-6 text-yellow-500" />
                                  ) : ((currentPage - 1) * 100) + index + 1 === 2 ? (
                                    <Medal className="w-5 h-5 text-zinc-400" />
                                  ) : ((currentPage - 1) * 100) + index + 1 === 3 ? (
                                    <Medal className="w-5 h-5 text-amber-600" />
                                  ) : (
                                    ((currentPage - 1) * 100) + index + 1
                                  )}
                                </span>
                              </div>

                              {/* Аватар */}
                              <Avatar className="w-10 h-10">
                                {participant.user.image ? (
                                  <AvatarImage src={participant.user.image} />
                                ) : (
                                  <AvatarFallback>
                                    {participant.user.name.charAt(0)}
                                  </AvatarFallback>
                                )}
                              </Avatar>

                              {/* Информация */}
                              <div className="flex-1">
                                <div className="font-medium">{participant.user.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Решено задач: {participant.solvedTasks}
                                </div>
                              </div>

                              {/* Баллы */}
                              <div className="text-right">
                                <div className="font-semibold text-lg">{participant.score}</div>
                                <div className="text-xs text-muted-foreground">баллов</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Пагинация */}
                      {hackathon.pagination && hackathon.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                          <div className="text-sm text-muted-foreground">
                            Страница {currentPage} из {hackathon.pagination.totalPages}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(p => Math.min(hackathon.pagination!.totalPages, p + 1))}
                              disabled={currentPage === hackathon.pagination.totalPages}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Описание для неактивных участников */}
              {(!hackathon.isParticipating || !isHackathonActive(hackathon)) && (
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                  <Markdown>{hackathon.description}</Markdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 