"use client";

import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  User,
  Mail,
  Trophy,
  Star,
  Target,
  BarChart2,
  Calendar,
  Edit,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActivityData {
  date: string;
  count: number;
}

interface ProfileData {
  user: {
    name: string;
    email: string;
    image: string;
  };
  stats: {
    total: number;
    tasksCompleted: number;
    byDifficulty: {
      easy: { total: number; solved: number };
      medium: { total: number; solved: number };
      hard: { total: number; solved: number };
    };
    рейтинг: number;
    местоВРейтинге: number;
    успешныеОтправки: number;
    всегоОтправок: number;
    процентУспеха: number;
    активныхДней: number;
    максСерия: number;
    участиеВХакатонах: number;
    победыВХакатонах: number;
    данныеАктивности: ActivityData[];
    доступныеГоды: number[];
    выбранныйГод: number;
  };
  submissions: Array<{
    id: string;
    date: string;
    taskId: string;
    taskTitle: string;
    type: "success" | "error";
  }>;
}

function getActivityColor(count: number): string {
  if (count === 0) return 'bg-[#0A1526]';
  if (count <= 2) return 'bg-[#0e4429]';
  if (count <= 4) return 'bg-[#006d32]';
  if (count <= 6) return 'bg-[#26a641]';
  return 'bg-[#39d353]';
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function getDaysInYear(year: number) {
  const firstDay = new Date(year, 0, 1);
  const lastDay = new Date(year, 11, 31);
  const days = [];
  const current = new Date(firstDay);

  while (current <= lastDay) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function getWeekNumber(date: Date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay()) / 7);
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`/api/profile?year=${selectedYear}`);
        if (!response.ok) throw new Error('Failed to fetch profile data');
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchProfileData();
    }
  }, [session, selectedYear]);

  const renderActivityGrid = () => {
    if (!profileData) return null;

    const year = selectedYear;
    const firstDayOfYear = new Date(year, 0, 1);
    const lastDayOfYear = new Date(year, 11, 31);
    
    let startOffset = firstDayOfYear.getDay();
    startOffset = startOffset === 0 ? 6 : startOffset - 1;

    const days = [];
    const currentDate = new Date(firstDayOfYear);
    
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    const activityData = profileData?.stats?.данныеАктивности || [];

    while (currentDate <= lastDayOfYear) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = activityData.find(d => d?.date === dateStr);
      
      days.push({
        date: dateStr,
        count: dayData?.count || 0
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="grid grid-flow-col gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-rows-7 gap-1">
            {week.map((day, dayIndex) => (
              day ? (
                <TooltipProvider key={`${weekIndex}-${dayIndex}`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-3 h-3 rounded-sm ${getActivityColor(day.count)} transition-colors hover:opacity-75 cursor-default`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="flex flex-col gap-1">
                      <p className="font-medium">{formatDate(day.date)}</p>
                      <p className="text-sm text-muted-foreground">
                        {day.count} {day.count === 1 ? 'решение' : day.count < 5 ? 'решения' : 'решений'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className="w-3 h-3 rounded-sm bg-transparent"
                />
              )
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return <div className="container py-6">Ошибка загрузки данных</div>;
  }

  const { stats, submissions } = profileData;

  return (
    <div className="container py-6 space-y-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Левая колонка - Профиль */}
        <div className="col-span-12 md:col-span-3 space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-4xl font-bold text-primary">
                  {session?.user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">{session?.user?.name || "Пользователь"}</h2>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Edit className="h-4 w-4" />
                Редактировать профиль
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Баллы
                  </span>
                  <span className="font-medium">{stats.рейтинг}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" />
                    Место в рейтинге
                  </span>
                  <span className="font-medium">№{stats.местоВРейтинге}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Участие в хакатонах
                  </span>
                  <span className="font-medium">{stats.участиеВХакатонах}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Победы в хакатонах
                  </span>
                  <span className="font-medium">{stats.победыВХакатонах}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Статистика решений */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Статистика решений</h3>
            
            <div className="relative flex justify-center">
              <div className="w-32 h-32 relative">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  {/* Фоновый круг */}
                  <circle
                    className="text-muted"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="46"
                    cx="50"
                    cy="50"
                  />
                  {/* Прогресс */}
                  <circle
                    className="text-primary"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="46"
                    cx="50"
                    cy="50"
                    strokeLinecap="round"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 46}`,
                      strokeDashoffset: `${2 * Math.PI * 46 * (1 - stats.tasksCompleted / stats.total)}`,
                      transition: 'stroke-dashoffset 0.5s ease'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.tasksCompleted}</div>
                    <div className="text-xs text-muted-foreground">из {stats.total}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-500">Легкие</span>
                  <span>
                    {stats?.byDifficulty?.easy?.solved ?? 0}/
                    {stats?.byDifficulty?.easy?.total ?? 0}
                  </span>
                </div>
                <Progress 
                  value={stats?.byDifficulty?.easy ? 
                    (stats.byDifficulty.easy.solved / stats.byDifficulty.easy.total) * 100 
                    : 0
                  } 
                  className="h-2 bg-green-500/20 [&>div]:bg-green-500" 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-500">Средние</span>
                  <span>
                    {stats?.byDifficulty?.medium?.solved ?? 0}/
                    {stats?.byDifficulty?.medium?.total ?? 0}
                  </span>
                </div>
                <Progress 
                  value={stats?.byDifficulty?.medium ? 
                    (stats.byDifficulty.medium.solved / stats.byDifficulty.medium.total) * 100 
                    : 0
                  } 
                  className="h-2 bg-yellow-500/20 [&>div]:bg-yellow-500" 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-500">Сложные</span>
                  <span>
                    {stats?.byDifficulty?.hard?.solved ?? 0}/
                    {stats?.byDifficulty?.hard?.total ?? 0}
                  </span>
                </div>
                <Progress 
                  value={stats?.byDifficulty?.hard ? 
                    (stats.byDifficulty.hard.solved / stats.byDifficulty.hard.total) * 100 
                    : 0
                  } 
                  className="h-2 bg-red-500/20 [&>div]:bg-red-500" 
                />
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Всего решено</span>
                <span className="font-medium">{stats.tasksCompleted} из {stats.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Успешные отправки</span>
                <span className="font-medium text-emerald-500">{stats.успешныеОтправки}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Процент успеха</span>
                <span className="font-medium">{stats.процентУспеха}%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Правая колонка - Активность */}
        <div className="col-span-12 md:col-span-9 space-y-6">
          <Card className="p-6">
            <div className="relative">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Активность решений</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.активныхДней} активных дней • Макс. серия: {stats.максСерия} дней
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {selectedYear}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(profileData?.stats?.доступныеГоды || [
                      new Date().getFullYear(),
                      new Date().getFullYear() - 1,
                      new Date().getFullYear() - 2,
                      new Date().getFullYear() - 3,
                      new Date().getFullYear() - 4
                    ]).map((year) => (
                      <DropdownMenuItem
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className="cursor-pointer"
                      >
                        {year}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="overflow-x-auto">
                <div className="flex gap-1">
                  <div className="grid grid-rows-7 text-xs text-muted-foreground pr-4">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
                      <span key={day} className="h-3 flex items-center justify-end hover:text-primary transition-colors">
                        {day}
                      </span>
                    ))}
                  </div>
                  {renderActivityGrid()}
                </div>

                <div className="flex justify-end mt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Меньше</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-sm bg-[#1E293BCC]" />
                      <div className="w-3 h-3 rounded-sm bg-[#0e4429]" />
                      <div className="w-3 h-3 rounded-sm bg-[#006d32]" />
                      <div className="w-3 h-3 rounded-sm bg-[#26a641]" />
                      <div className="w-3 h-3 rounded-sm bg-[#39d353]" />
                    </div>
                    <span>Больше</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Последние отправки */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Последние отправки</h3>
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-4 bg-muted/5 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{submission.taskTitle}</p>
                      <p className="text-sm text-muted-foreground">{submission.date}</p>
                    </div>
                  </div>
                  {submission.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 