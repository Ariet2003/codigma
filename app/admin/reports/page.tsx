"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Trophy,
  Medal,
  Award,
  Target,
  BarChart,
  Calendar,
  Lock,
  Unlock,
  Clock,
  ChevronLeft,
  ChevronRight,
  Code,
  CheckCircle2,
  CircleDot,
  Binary,
  Send,
  Timer,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  CircleDashed,
  Hourglass,
  FileQuestion,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface UserReport {
  totalUsers: number;
  topUsers: {
    displayName: string;
    totalScore: number;
    tasksCompleted: number;
    hackathonsParticipated: number;
  }[];
  taskStats: {
    total: number;
    average: number;
    max: number;
  };
  hackathonStats: {
    total: number;
    average: number;
    max: number;
  };
}

interface HackathonReport {
  totalHackathons: number;
  types: {
    open: number;
    closed: number;
  };
  status: {
    upcoming: number;
    active: number;
    completed: number;
  };
  hackathons: {
    id: string;
    title: string;
    isOpen: boolean;
    startDate: string;
    endDate: string;
    participantsCount: number;
    totalScore: number;
    averageScore: number;
    status: 'upcoming' | 'active' | 'completed';
  }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
  };
}

interface TaskReport {
  totalTasks: number;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  testCases: {
    min: number;
    max: number;
    average: number;
  };
  topTasksByTestCases: {
    id: string;
    title: string;
    difficulty: string;
    testCasesCount: number;
  }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
  };
}

interface SubmissionReport {
  totalSubmissions: number;
  statusStats: {
    pending: number;
    processing: number;
    accepted: number;
    rejected: number;
    error: number;
  };
  performanceStats: {
    testsPassedPercent: number;
    memory: {
      min: number;
      max: number;
      average: number;
    };
    executionTime: {
      min: number;
      max: number;
      average: number;
    };
  };
  recentSubmissions: {
    id: string;
    status: string;
    testsPassed: number;
    testsTotal: number;
    passedPercent: number;
    memory: number;
    executionTime: number;
    taskTitle: string;
    taskDifficulty: string;
    userName: string;
    hackathonTitle: string;
    createdAt: string;
    language?: string;
  }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
  };
}

interface RequestReport {
  totalRequests: number;
  statusStats: {
    pending: number;
    approved: number;
    rejected: number;
  };
  recentRequests: {
    id: string;
    status: string;
    createdAt: string;
    userName: string;
    userEmail: string;
    hackathonTitle: string;
    hackathonStartDate: string;
    hackathonEndDate: string;
    hackathonIsOpen: boolean;
  }[];
  hackathonStats: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    stats: {
      pending: number;
      approved: number;
      rejected: number;
      total: number;
    };
  }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
  };
  statsPagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
  };
}

type ReportType = 'users' | 'hackathons' | 'tasks' | 'submissions' | 'requests';

export default function ReportsPage() {
  const [userReport, setUserReport] = useState<UserReport | null>(null);
  const [hackathonReport, setHackathonReport] = useState<HackathonReport | null>(null);
  const [taskReport, setTaskReport] = useState<TaskReport | null>(null);
  const [submissionReport, setSubmissionReport] = useState<SubmissionReport | null>(null);
  const [requestReport, setRequestReport] = useState<RequestReport | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);
  const [statsPage, setStatsPage] = useState(1);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        if (activeReport === 'users' || !activeReport) {
          const userResponse = await fetch('/api/reports/users');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserReport(userData);
          }
        }
        
        if (activeReport === 'hackathons' || !activeReport) {
          const hackathonResponse = await fetch(`/api/reports/hackathons?page=${currentPage}`);
          if (hackathonResponse.ok) {
            const hackathonData = await hackathonResponse.json();
            setHackathonReport(hackathonData);
          }
        }

        if (activeReport === 'tasks' || !activeReport) {
          const taskResponse = await fetch('/api/reports/tasks');
          if (taskResponse.ok) {
            const taskData = await taskResponse.json();
            setTaskReport(taskData);
          }
        }

        if (activeReport === 'submissions' || !activeReport) {
          const submissionResponse = await fetch(`/api/reports/submissions?page=${currentPage}`);
          if (submissionResponse.ok) {
            const submissionData = await submissionResponse.json();
            setSubmissionReport(submissionData);
          }
        }

        if (activeReport === 'requests' || !activeReport) {
          const requestResponse = await fetch(`/api/reports/requests?page=${currentPage}&statsPage=${statsPage}`);
          if (requestResponse.ok) {
            const requestData = await requestResponse.json();
            setRequestReport(requestData);
          }
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, [currentPage, statsPage, activeReport]);

  if (!userReport || !hackathonReport || !taskReport || !submissionReport || !requestReport) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <BarChart className="h-10 w-10 text-muted-foreground animate-pulse" />
          <h3 className="mt-4 text-lg font-semibold">Загрузка отчетов</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Пожалуйста, подождите, идет сбор данных...
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600';
      case 'active': return 'text-green-600';
      case 'completed': return 'text-gray-600';
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Предстоящий';
      case 'active': return 'Активный';
      case 'completed': return 'Завершен';
      default: return status;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Hourglass className="h-4 w-4 text-blue-500" />;
      case 'processing': return <CircleDashed className="h-4 w-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return null;
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 Б';
    if (bytes < 1024) return `${Math.round(bytes * 10) / 10} Б`;
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round(bytes * 10) / 10} Б (${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]})`;
  };

  const formatTime = (ms: number) => {
    if (!ms) return '0 мс';
    if (ms < 1000) return `${ms} мс`;
    return `${ms} мс (${(ms / 1000).toFixed(2)} с)`;
  };

  const getRequestStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Hourglass className="h-4 w-4 text-blue-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getRequestStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'На рассмотрении';
      case 'approved': return 'Одобрена';
      case 'rejected': return 'Отклонена';
      default: return status;
    }
  };

  const renderReportSelector = () => (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-3">
          <div className="bg-[#4E7AFF]/10 p-2 rounded-lg">
            <BarChart className="w-6 h-6 text-[#4E7AFF]" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#4E7AFF] to-[#4E7AFF]/60 bg-clip-text text-transparent">
              Аналитика и отчеты
            </h2>
            <p className="text-muted-foreground mt-2">
              Выберите тип отчета для просмотра подробной статистики
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            id: 'users',
            title: 'Пользователи',
            description: 'Статистика по пользователям и их активности',
            icon: <Users className="w-5 h-5" />,
            count: userReport.totalUsers,
            countText: 'пользователей'
          },
          {
            id: 'hackathons',
            title: 'Хакатоны',
            description: 'Информация о проведенных и текущих хакатонах',
            icon: <Trophy className="w-5 h-5" />,
            count: hackathonReport.totalHackathons,
            countText: 'хакатонов'
          },
          {
            id: 'tasks',
            title: 'Задачи',
            description: 'Статистика по задачам и их решениям',
            icon: <Code className="w-5 h-5" />,
            count: taskReport.totalTasks,
            countText: 'задач'
          },
          {
            id: 'submissions',
            title: 'Решения',
            description: 'Анализ отправленных решений и их статусов',
            icon: <Send className="w-5 h-5" />,
            count: submissionReport.totalSubmissions,
            countText: 'решений'
          },
          {
            id: 'requests',
            title: 'Заявки',
            description: 'Статистика заявок на участие в хакатонах',
            icon: <FileQuestion className="w-5 h-5" />,
            count: requestReport.totalRequests,
            countText: 'заявок'
          }
        ].map((item) => (
          <Button
            key={item.id}
            onClick={() => setActiveReport(item.id as ReportType)}
            variant={activeReport === item.id ? "default" : "outline"}
            className={cn(
              "relative w-full h-auto flex-col items-start gap-4 p-6",
              "transition-all duration-300 ease-out",
              "hover:border-[#4E7AFF] hover:bg-[#4E7AFF]/5 hover:text-[#4E7AFF]",
              "active:scale-[0.98]",
              "group",
              activeReport === item.id 
                ? "border-[#4E7AFF] bg-[#4E7AFF]/5 text-[#4E7AFF]" 
                : "border-border"
            )}
          >
            <div className={cn(
              "p-2 rounded-lg transition-colors duration-300",
              activeReport === item.id 
                ? "bg-[#4E7AFF]/10" 
                : "bg-[#4E7AFF]/5 group-hover:bg-[#4E7AFF]/10"
            )}>
              {item.icon}
            </div>
            <div className="text-left space-y-2">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className={cn(
                "text-sm transition-colors duration-300",
                activeReport === item.id 
                  ? "text-[#4E7AFF]/70" 
                  : "text-muted-foreground group-hover:text-[#4E7AFF]/70"
              )}>
                {item.description}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{item.count}</span>
                <span className={cn(
                  "text-sm transition-colors duration-300",
                  activeReport === item.id 
                    ? "text-[#4E7AFF]/70" 
                    : "text-muted-foreground group-hover:text-[#4E7AFF]/70"
                )}>
                  {item.countText}
                </span>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );

  const ReportHeader = ({ icon: Icon, title, onBack }: { icon: any, title: string, onBack: () => void }) => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="bg-[#4E7AFF]/10 p-2.5 rounded-xl">
          <Icon className="w-6 h-6 text-[#4E7AFF]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4E7AFF] to-[#4E7AFF]/60 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Просмотр статистики и аналитики
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        onClick={onBack}
        className="flex items-center gap-2 transition-all duration-200 hover:bg-[#4E7AFF]/5 hover:text-[#4E7AFF] hover:border-[#4E7AFF]"
      >
        <ChevronLeft className="h-4 w-4" />
        Назад
      </Button>
    </div>
  );

  const StatsCard = ({ title, icon: Icon, children, className }: { title: string, icon: any, children: React.ReactNode, className?: string }) => (
    <Card className={cn("transition-all duration-200 hover:shadow-md hover:border-[#4E7AFF]/20", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );

  const DataTable = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-xl border bg-card text-card-foreground shadow transition-all duration-200 hover:shadow-md hover:border-[#4E7AFF]/20">
      {children}
    </div>
  );

  const PaginationControls = ({ currentPage, totalPages, onPrevPage, onNextPage }: { 
    currentPage: number, 
    totalPages: number, 
    onPrevPage: () => void, 
    onNextPage: () => void 
  }) => (
    <div className="flex items-center justify-end space-x-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevPage}
        disabled={currentPage === 1}
        className="transition-all duration-200 hover:bg-[#4E7AFF]/5 hover:text-[#4E7AFF] hover:border-[#4E7AFF]"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        Страница {currentPage} из {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        className="transition-all duration-200 hover:bg-[#4E7AFF]/5 hover:text-[#4E7AFF] hover:border-[#4E7AFF]"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderUsersReport = () => (
    <>
      <ReportHeader 
        icon={Users} 
        title="Отчет по пользователям" 
        onBack={() => setActiveReport(null)} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Всего пользователей" icon={Users}>
          <div className="text-2xl font-bold">{userReport.totalUsers}</div>
        </StatsCard>

        <StatsCard title="Всего решено задач" icon={Target}>
          <div className="text-2xl font-bold">{userReport.taskStats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            В среднем {userReport.taskStats.average} задач на пользователя
          </p>
        </StatsCard>

        <StatsCard title="Участий в хакатонах" icon={Trophy}>
          <div className="text-2xl font-bold">{userReport.hackathonStats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            В среднем {userReport.hackathonStats.average} хакатонов на пользователя
          </p>
        </StatsCard>

        <StatsCard title="Рекорд по задачам" icon={Award}>
          <div className="text-2xl font-bold">{userReport.taskStats.max}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Максимум решенных задач одним пользователем
          </p>
        </StatsCard>
      </div>

      <DataTable>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Medal className="h-5 w-5 text-[#4E7AFF]" />
            Топ пользователей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="text-center font-medium">Пользователь</TableHead>
                <TableHead className="text-center font-medium">Баллы</TableHead>
                <TableHead className="text-center font-medium">Решено задач</TableHead>
                <TableHead className="text-center font-medium">Участие в хакатонах</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userReport.topUsers.map((user, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell className="text-center font-medium">{user.displayName}</TableCell>
                  <TableCell className="text-center text-[#4E7AFF]">{user.totalScore.toFixed(1)}</TableCell>
                  <TableCell className="text-center">{user.tasksCompleted}</TableCell>
                  <TableCell className="text-center">{user.hackathonsParticipated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </DataTable>
    </>
  );

  const renderHackathonsReport = () => (
    <>
      <ReportHeader 
        icon={Trophy} 
        title="Отчет по хакатонам" 
        onBack={() => setActiveReport(null)} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Всего хакатонов" icon={Trophy}>
          <div className="text-2xl font-bold">{hackathonReport.totalHackathons}</div>
        </StatsCard>

        <StatsCard title="Статус регистрации" icon={Lock}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-[#4E7AFF]">Открытые</div>
              <div className="text-2xl font-bold">{hackathonReport.types.open}</div>
            </div>
            <div>
              <div className="text-sm text-red-500">Закрытые</div>
              <div className="text-2xl font-bold">{hackathonReport.types.closed}</div>
            </div>
          </div>
        </StatsCard>

        <StatsCard title="Статус проведения" icon={Clock} className="md:col-span-2">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-blue-500">Предстоящие</span>
              <div className="text-2xl font-bold mt-1">{hackathonReport.status.upcoming}</div>
            </div>
            <div>
              <span className="text-sm text-green-500">Активные</span>
              <div className="text-2xl font-bold mt-1">{hackathonReport.status.active}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Завершенные</span>
              <div className="text-2xl font-bold mt-1">{hackathonReport.status.completed}</div>
            </div>
          </div>
        </StatsCard>
      </div>

      <DataTable>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-[#4E7AFF]" />
            Список хакатонов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="text-center font-medium">Название</TableHead>
                <TableHead className="text-center font-medium">Статус</TableHead>
                <TableHead className="text-center font-medium">Регистрация</TableHead>
                <TableHead className="text-center font-medium">Даты проведения</TableHead>
                <TableHead className="text-center font-medium">Участников</TableHead>
                <TableHead className="text-center font-medium">Средний балл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hackathonReport.hackathons.map((hackathon) => (
                <TableRow key={hackathon.id} className="hover:bg-muted/50">
                  <TableCell className="text-center font-medium">{hackathon.title}</TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      hackathon.status === 'upcoming' && "bg-blue-100 text-blue-700",
                      hackathon.status === 'active' && "bg-green-100 text-green-700",
                      hackathon.status === 'completed' && "bg-gray-100 text-gray-700"
                    )}>
                      {getStatusText(hackathon.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      hackathon.isOpen 
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    )}>
                      {hackathon.isOpen ? "Открыта" : "Закрыта"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    {format(new Date(hackathon.startDate), 'd MMM', { locale: ru })} -{' '}
                    {format(new Date(hackathon.endDate), 'd MMM yyyy', { locale: ru })}
                  </TableCell>
                  <TableCell className="text-center">{hackathon.participantsCount}</TableCell>
                  <TableCell className="text-center text-[#4E7AFF] font-medium">
                    {hackathon.averageScore.toFixed(1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            currentPage={currentPage}
            totalPages={hackathonReport.pagination.totalPages}
            onPrevPage={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            onNextPage={() => setCurrentPage(prev => Math.min(hackathonReport.pagination.totalPages, prev + 1))}
          />
        </CardContent>
      </DataTable>
    </>
  );

  const renderTasksReport = () => (
    <>
      <ReportHeader 
        icon={Code} 
        title="Отчет по задачам" 
        onBack={() => setActiveReport(null)} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard title="Всего задач" icon={Code}>
          <div className="text-2xl font-bold">{taskReport.totalTasks}</div>
        </StatsCard>

        <StatsCard title="Сложность задач" icon={CircleDot}>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-green-600">Легкие</span>
              <span className="font-bold">{taskReport.difficulty.easy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-yellow-600">Средние</span>
              <span className="font-bold">{taskReport.difficulty.medium}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-red-600">Сложные</span>
              <span className="font-bold">{taskReport.difficulty.hard}</span>
            </div>
          </div>
        </StatsCard>

        <StatsCard title="Тест-кейсы" icon={CheckCircle2}>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Минимум</span>
              <span className="font-bold">{taskReport.testCases.min}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Максимум</span>
              <span className="font-bold">{taskReport.testCases.max}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">В среднем</span>
              <span className="font-bold">{taskReport.testCases.average.toFixed(1)}</span>
            </div>
          </div>
        </StatsCard>
      </div>

      <DataTable>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Binary className="h-5 w-5 text-[#4E7AFF]" />
            Топ задач по количеству тест-кейсов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="text-center font-medium">Название задачи</TableHead>
                <TableHead className="text-center font-medium">Сложность</TableHead>
                <TableHead className="text-center font-medium">Количество тест-кейсов</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taskReport.topTasksByTestCases.map((task) => (
                <TableRow key={task.id} className="hover:bg-muted/50">
                  <TableCell className="text-center font-medium">{task.title}</TableCell>
                  <TableCell className="text-center">
                    <span className={getDifficultyColor(task.difficulty)}>
                      {task.difficulty}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{task.testCasesCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            currentPage={currentPage}
            totalPages={taskReport.pagination.totalPages}
            onPrevPage={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            onNextPage={() => setCurrentPage(prev => Math.min(taskReport.pagination.totalPages, prev + 1))}
          />
        </CardContent>
      </DataTable>
    </>
  );

  const renderSubmissionsReport = () => (
    <>
      <ReportHeader 
        icon={Send} 
        title="Отчет по решениям" 
        onBack={() => setActiveReport(null)} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Всего решений" icon={Send}>
          <div className="text-2xl font-bold">{submissionReport.totalSubmissions}</div>
        </StatsCard>

        <StatsCard title="Статусы решений" icon={CheckCircle2}>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Hourglass className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Ожидание</span>
              </div>
              <span className="font-bold">{submissionReport.statusStats.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CircleDashed className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Обработка</span>
              </div>
              <span className="font-bold">{submissionReport.statusStats.processing}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Принято</span>
              </div>
              <span className="font-bold">{submissionReport.statusStats.accepted}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Отклонено</span>
              </div>
              <span className="font-bold">{submissionReport.statusStats.rejected}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">Ошибка</span>
              </div>
              <span className="font-bold">{submissionReport.statusStats.error}</span>
            </div>
          </div>
        </StatsCard>

        <StatsCard title="Использование памяти" icon={Database}>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Минимум</span>
              <span className="font-bold">{formatBytes(submissionReport.performanceStats.memory.min)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Максимум</span>
              <span className="font-bold">{formatBytes(submissionReport.performanceStats.memory.max)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">В среднем</span>
              <span className="font-bold">{formatBytes(submissionReport.performanceStats.memory.average)}</span>
            </div>
          </div>
        </StatsCard>

        <StatsCard title="Время выполнения" icon={Timer}>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Минимум</span>
              <span className="font-bold">{formatTime(submissionReport.performanceStats.executionTime.min)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Максимум</span>
              <span className="font-bold">{formatTime(submissionReport.performanceStats.executionTime.max)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">В среднем</span>
              <span className="font-bold">{formatTime(submissionReport.performanceStats.executionTime.average)}</span>
            </div>
          </div>
        </StatsCard>
      </div>

      <DataTable>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-[#4E7AFF]" />
            Последние решения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="text-center font-medium">Статус</TableHead>
                <TableHead className="text-center font-medium">Задача</TableHead>
                <TableHead className="text-center font-medium">Пользователь</TableHead>
                <TableHead className="text-center font-medium">Хакатон</TableHead>
                <TableHead className="text-center font-medium">Тесты</TableHead>
                <TableHead className="text-center font-medium">Память</TableHead>
                <TableHead className="text-center font-medium">Время</TableHead>
                <TableHead className="text-center font-medium">Язык</TableHead>
                <TableHead className="text-center font-medium">Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissionReport.recentSubmissions.map((submission) => (
                <TableRow key={submission.id} className="hover:bg-muted/50">
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      {getStatusIcon(submission.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">{submission.taskTitle}</TableCell>
                  <TableCell className="text-center">{submission.userName}</TableCell>
                  <TableCell className="text-center">
                    {submission.hackathonTitle || '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {submission.testsPassed}/{submission.testsTotal}{' '}
                    <span className="text-xs text-muted-foreground">
                      ({submission.passedPercent.toFixed(1)}%)
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{formatBytes(submission.memory)}</TableCell>
                  <TableCell className="text-center">{formatTime(submission.executionTime)}</TableCell>
                  <TableCell className="text-center font-mono text-sm">{submission.language || '—'}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    {format(new Date(submission.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            currentPage={currentPage}
            totalPages={submissionReport.pagination.totalPages}
            onPrevPage={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            onNextPage={() => setCurrentPage(prev => Math.min(submissionReport.pagination.totalPages, prev + 1))}
          />
        </CardContent>
      </DataTable>
    </>
  );

  const renderRequestsReport = () => (
    <>
      <ReportHeader 
        icon={FileQuestion} 
        title="Отчет по заявкам" 
        onBack={() => setActiveReport(null)} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard title="Всего заявок" icon={FileQuestion}>
          <div className="text-2xl font-bold">{requestReport.totalRequests}</div>
        </StatsCard>

        <StatsCard title="Статусы заявок" icon={CheckCircle2}>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <Hourglass className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">На рассмотрении</span>
              </div>
              <span className="text-2xl font-bold">{requestReport.statusStats.pending}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Одобрено</span>
              </div>
              <span className="text-2xl font-bold">{requestReport.statusStats.approved}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Отклонено</span>
              </div>
              <span className="text-2xl font-bold">{requestReport.statusStats.rejected}</span>
            </div>
          </div>
        </StatsCard>
      </div>

      <DataTable>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-[#4E7AFF]" />
            Статистика по закрытым хакатонам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="text-center font-medium">Хакатон</TableHead>
                <TableHead className="text-center font-medium">Даты проведения</TableHead>
                <TableHead className="text-center font-medium">На рассмотрении</TableHead>
                <TableHead className="text-center font-medium">Одобрено</TableHead>
                <TableHead className="text-center font-medium">Отклонено</TableHead>
                <TableHead className="text-center font-medium">Всего заявок</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestReport.hackathonStats.map((hackathon) => (
                <TableRow key={hackathon.id} className="hover:bg-muted/50">
                  <TableCell className="text-center font-medium">{hackathon.title}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    {format(new Date(hackathon.startDate), 'd MMM', { locale: ru })} -{' '}
                    {format(new Date(hackathon.endDate), 'd MMM yyyy', { locale: ru })}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Hourglass className="h-4 w-4 text-blue-500" />
                      <span>{hackathon.stats.pending}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{hackathon.stats.approved}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>{hackathon.stats.rejected}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">{hackathon.stats.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            currentPage={statsPage}
            totalPages={requestReport.statsPagination.totalPages}
            onPrevPage={() => setStatsPage(prev => Math.max(1, prev - 1))}
            onNextPage={() => setStatsPage(prev => Math.min(requestReport.statsPagination.totalPages, prev + 1))}
          />
        </CardContent>
      </DataTable>

      <DataTable>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileQuestion className="h-5 w-5 text-[#4E7AFF]" />
            Последние заявки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="text-center font-medium">Статус</TableHead>
                <TableHead className="text-center font-medium">Пользователь</TableHead>
                <TableHead className="text-center font-medium">Email</TableHead>
                <TableHead className="text-center font-medium">Хакатон</TableHead>
                <TableHead className="text-center font-medium">Даты хакатона</TableHead>
                <TableHead className="text-center font-medium">Регистрация</TableHead>
                <TableHead className="text-center font-medium">Дата заявки</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestReport.recentRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/50">
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      {getRequestStatusIcon(request.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">{request.userName}</TableCell>
                  <TableCell className="text-center">{request.userEmail}</TableCell>
                  <TableCell className="text-center">{request.hackathonTitle}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    {format(new Date(request.hackathonStartDate), 'd MMM', { locale: ru })} -{' '}
                    {format(new Date(request.hackathonEndDate), 'd MMM yyyy', { locale: ru })}
                  </TableCell>
                  <TableCell className="text-center">
                    {request.hackathonIsOpen ? (
                      <span className="text-green-600">Открыта</span>
                    ) : (
                      <span className="text-red-600">Закрыта</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    {format(new Date(request.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            currentPage={currentPage}
            totalPages={requestReport.pagination.totalPages}
            onPrevPage={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            onNextPage={() => setCurrentPage(prev => Math.min(requestReport.pagination.totalPages, prev + 1))}
          />
        </CardContent>
      </DataTable>
    </>
  );

  return (
    <div className="h-full flex-1 flex-col space-y-8 flex">
      {!activeReport ? (
        renderReportSelector()
      ) : (
        <div className="p-8 space-y-8">
          {activeReport === 'users' && renderUsersReport()}
          {activeReport === 'hackathons' && renderHackathonsReport()}
          {activeReport === 'tasks' && renderTasksReport()}
          {activeReport === 'submissions' && renderSubmissionsReport()}
          {activeReport === 'requests' && renderRequestsReport()}
        </div>
      )}
    </div>
  );
} 