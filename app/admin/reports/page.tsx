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
  Mail,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Excel from 'exceljs';

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
  status: {
    active: number;
    completed: number;
    upcoming: number;
  };
  hackathons: Array<{
    id: string;
    title: string;
    isOpen: boolean;
    startDate: string;
    endDate: string;
    participantsCount: number;
    tasksCount: number;
    totalScore: number;
    averageScore: number;
    status: "upcoming" | "active" | "completed";
  }>;
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
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="relative h-10 w-10">
          <div className="absolute h-10 w-10 rounded-full border-4 border-[#4E7AFF]/20"></div>
          <div className="absolute h-10 w-10 rounded-full border-4 border-[#4E7AFF] border-t-transparent animate-spin"></div>
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
    if (ms < 1) return '< 1 мс';
    return `${(ms).toFixed(3)} мс`;
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

  const exportAllReports = async () => {
    const workbook = new Excel.Workbook();
    workbook.creator = 'Codigma';
    workbook.created = new Date();

    // Добавляем листы из отчета по пользователям
    const usersStatsSheet = workbook.addWorksheet('Статистика пользователей', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });
    const usersTopSheet = workbook.addWorksheet('Топ пользователей', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Добавляем листы из отчета по хакатонам
    const hackathonsStatsSheet = workbook.addWorksheet('Статистика хакатонов', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });
    const hackathonsListSheet = workbook.addWorksheet('Список хакатонов', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Добавляем листы из отчета по задачам
    const tasksStatsSheet = workbook.addWorksheet('Статистика задач', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });
    const tasksTopSheet = workbook.addWorksheet('Топ задач', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Добавляем листы из отчета по решениям
    const submissionsStatsSheet = workbook.addWorksheet('Статистика решений', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });
    const submissionsListSheet = workbook.addWorksheet('Последние решения', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Добавляем листы из отчета по заявкам
    const requestsStatsSheet = workbook.addWorksheet('Статистика заявок', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });
    const requestsHackathonsSheet = workbook.addWorksheet('Статистика заявок по хакатонам', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });
    const requestsListSheet = workbook.addWorksheet('Последние заявки', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Функция для создания заголовка листа
    const createSheetHeader = (sheet: Excel.Worksheet, title: string, columnsCount: number) => {
      sheet.mergeCells(`A1:${String.fromCharCode(65 + columnsCount - 1)}1`);
      const titleRow = sheet.getRow(1);
      titleRow.height = 40;
      const titleCell = titleRow.getCell(1);
      titleCell.value = title;
      titleCell.font = {
        name: 'Arial',
        size: 16,
        bold: true,
        color: { argb: 'FFFFFF' }
      };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4E7AFF' }
      };
      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      sheet.addRow([]);
    };

    // Функция для создания заголовков таблицы
    const createTableHeader = (sheet: Excel.Worksheet, headers: string[]) => {
      const headerRow = sheet.addRow(headers);
      headerRow.height = 30;
      headerRow.eachCell((cell) => {
        cell.font = {
          name: 'Arial',
          size: 12,
          bold: true,
          color: { argb: '4E7AFF' }
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8F9FA' }
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: '4E7AFF' } }
        };
      });
    };

    // Заполняем отчет по пользователям
    createSheetHeader(usersStatsSheet, 'Общая статистика по пользователям', 2);
    usersStatsSheet.columns = [{ width: 50 }, { width: 30 }];
    createTableHeader(usersStatsSheet, ['Показатель', 'Значение']);
    const usersStatsData = [
      ['Всего пользователей', userReport.totalUsers],
      ['Всего решено задач', userReport.taskStats.total],
      ['Среднее количество задач на пользователя', userReport.taskStats.average],
      ['Максимум решенных задач', userReport.taskStats.max],
      ['Всего участий в хакатонах', userReport.hackathonStats.total],
      ['Среднее количество хакатонов на пользователя', userReport.hackathonStats.average],
      ['Максимум участий в хакатонах', userReport.hackathonStats.max]
    ];
    usersStatsData.forEach(row => {
      const dataRow = usersStatsSheet.addRow(row);
      dataRow.height = 25;
      dataRow.getCell(1).font = { name: 'Arial', size: 11, color: { argb: '000000' } };
      dataRow.getCell(2).font = { name: 'Arial', size: 11, bold: true, color: { argb: '4E7AFF' } };
    });

    createSheetHeader(usersTopSheet, 'Топ пользователей', 4);
    usersTopSheet.columns = [
      { width: 40 },
      { width: 15 },
      { width: 20 },
      { width: 25 }
    ];
    createTableHeader(usersTopSheet, ['Пользователь', 'Баллы', 'Решено задач', 'Участие в хакатонах']);
    userReport.topUsers.forEach(user => {
      const userRow = usersTopSheet.addRow([
        user.displayName,
        Number(user.totalScore.toFixed(1)),
        user.tasksCompleted,
        user.hackathonsParticipated
      ]);
      userRow.height = 25;
      userRow.eachCell((cell, colNumber) => {
        cell.font = {
          name: 'Arial',
          size: 11,
          color: colNumber === 2 ? { argb: '4E7AFF' } : { argb: '000000' },
          bold: colNumber === 2
        };
      });
    });

    // Заполняем отчет по хакатонам
    createSheetHeader(hackathonsStatsSheet, 'Общая статистика по хакатонам', 2);
    hackathonsStatsSheet.columns = [{ width: 50 }, { width: 30 }];
    createTableHeader(hackathonsStatsSheet, ['Показатель', 'Значение']);
    const hackathonsStatsData = [
      ['Всего хакатонов', hackathonReport.totalHackathons],
      ['Предстоящие хакатоны', hackathonReport.status.upcoming],
      ['Активные хакатоны', hackathonReport.status.active],
      ['Завершенные хакатоны', hackathonReport.status.completed]
    ];
    hackathonsStatsData.forEach(row => {
      const dataRow = hackathonsStatsSheet.addRow(row);
      dataRow.height = 25;
      dataRow.getCell(1).font = { name: 'Arial', size: 11, color: { argb: '000000' } };
      dataRow.getCell(2).font = { name: 'Arial', size: 11, bold: true, color: { argb: '4E7AFF' } };
    });

    createSheetHeader(hackathonsListSheet, 'Список хакатонов', 6);
    hackathonsListSheet.columns = [
      { width: 40 },
      { width: 20 },
      { width: 20 },
      { width: 30 },
      { width: 15 },
      { width: 15 }
    ];
    createTableHeader(hackathonsListSheet, [
      'Название',
      'Статус',
      'Регистрация',
      'Даты проведения',
      'Участников',
      'Средний балл'
    ]);
    hackathonReport.hackathons.forEach(hackathon => {
      const dates = `${format(new Date(hackathon.startDate), 'd MMM', { locale: ru })} - ${format(new Date(hackathon.endDate), 'd MMM yyyy', { locale: ru })}`;
      const status = getStatusText(hackathon.status);
      const registration = hackathon.isOpen ? "Открыта" : "Закрыта";

      const hackathonRow = hackathonsListSheet.addRow([
        hackathon.title,
        status,
        registration,
        dates,
        hackathon.participantsCount,
        hackathon.averageScore.toFixed(1)
      ]);
      hackathonRow.height = 25;
      hackathonRow.eachCell((cell, colNumber) => {
        cell.font = {
          name: 'Arial',
          size: 11,
          color: { argb: '000000' }
        };
        if (colNumber === 2) {
          switch (hackathon.status) {
            case 'upcoming':
              cell.font.color = { argb: '0000FF' };
              break;
            case 'active':
              cell.font.color = { argb: '008000' };
              break;
            case 'completed':
              cell.font.color = { argb: '808080' };
              break;
          }
        }
        if (colNumber === 3) {
          cell.font.color = { argb: hackathon.isOpen ? '008000' : 'FF0000' };
        }
      });
    });

    // Заполняем отчет по задачам
    createSheetHeader(tasksStatsSheet, 'Общая статистика по задачам', 2);
    tasksStatsSheet.columns = [{ width: 50 }, { width: 30 }];
    createTableHeader(tasksStatsSheet, ['Показатель', 'Значение']);
    const tasksStatsData = [
      ['Всего задач', taskReport.totalTasks],
      ['Легкие задачи', taskReport.difficulty.easy],
      ['Средние задачи', taskReport.difficulty.medium],
      ['Сложные задачи', taskReport.difficulty.hard],
      ['Минимум тест-кейсов', taskReport.testCases.min],
      ['Максимум тест-кейсов', taskReport.testCases.max],
      ['Среднее количество тест-кейсов', taskReport.testCases.average.toFixed(1)]
    ];
    tasksStatsData.forEach(row => {
      const dataRow = tasksStatsSheet.addRow(row);
      dataRow.height = 25;
      dataRow.getCell(1).font = { name: 'Arial', size: 11, color: { argb: '000000' } };
      dataRow.getCell(2).font = { name: 'Arial', size: 11, bold: true, color: { argb: '4E7AFF' } };
    });

    createSheetHeader(tasksTopSheet, 'Топ задач по количеству тест-кейсов', 3);
    tasksTopSheet.columns = [
      { width: 50 },
      { width: 20 },
      { width: 25 }
    ];
    createTableHeader(tasksTopSheet, ['Название задачи', 'Сложность', 'Количество тест-кейсов']);
    taskReport.topTasksByTestCases.forEach(task => {
      const taskRow = tasksTopSheet.addRow([
        task.title,
        task.difficulty,
        task.testCasesCount
      ]);
      taskRow.height = 25;
      taskRow.eachCell((cell, colNumber) => {
        cell.font = {
          name: 'Arial',
          size: 11,
          color: colNumber === 2 ? { argb: getDifficultyColor(task.difficulty).replace('text-', '') } : { argb: '000000' }
        };
      });
    });

    // Заполняем отчет по решениям
    createSheetHeader(submissionsStatsSheet, 'Общая статистика по решениям', 2);
    submissionsStatsSheet.columns = [{ width: 50 }, { width: 30 }];
    createTableHeader(submissionsStatsSheet, ['Показатель', 'Значение']);
    const submissionsStatsData = [
      ['Всего решений', submissionReport.totalSubmissions],
      ['Ожидают проверки', submissionReport.statusStats.pending],
      ['В обработке', submissionReport.statusStats.processing],
      ['Принято', submissionReport.statusStats.accepted],
      ['Отклонено', submissionReport.statusStats.rejected],
      ['Ошибка', submissionReport.statusStats.error],
      ['Процент успешных тестов', `${submissionReport.performanceStats.testsPassedPercent.toFixed(1)}%`],
      ['Минимальное использование памяти', formatBytes(submissionReport.performanceStats.memory.min)],
      ['Максимальное использование памяти', formatBytes(submissionReport.performanceStats.memory.max)],
      ['Среднее использование памяти', formatBytes(submissionReport.performanceStats.memory.average)],
      ['Минимальное время выполнения', formatTime(submissionReport.performanceStats.executionTime.min)],
      ['Максимальное время выполнения', formatTime(submissionReport.performanceStats.executionTime.max)],
      ['Среднее время выполнения', formatTime(submissionReport.performanceStats.executionTime.average)]
    ];
    submissionsStatsData.forEach(row => {
      const dataRow = submissionsStatsSheet.addRow(row);
      dataRow.height = 25;
      dataRow.getCell(1).font = { name: 'Arial', size: 11, color: { argb: '000000' } };
      dataRow.getCell(2).font = { name: 'Arial', size: 11, bold: true, color: { argb: '4E7AFF' } };
    });

    createSheetHeader(submissionsListSheet, 'Последние решения', 9);
    submissionsListSheet.columns = [
      { width: 15 },
      { width: 40 },
      { width: 30 },
      { width: 30 },
      { width: 20 },
      { width: 25 },
      { width: 25 },
      { width: 15 },
      { width: 20 }
    ];
    createTableHeader(submissionsListSheet, [
      'Статус',
      'Задача',
      'Пользователь',
      'Хакатон',
      'Тесты',
      'Память',
      'Время',
      'Язык',
      'Дата'
    ]);
    submissionReport.recentSubmissions.forEach(submission => {
      const submissionRow = submissionsListSheet.addRow([
        submission.status,
        submission.taskTitle,
        submission.userName,
        submission.hackathonTitle || '—',
        `${submission.testsPassed}/${submission.testsTotal} (${submission.passedPercent.toFixed(1)}%)`,
        formatBytes(submission.memory),
        formatTime(submission.executionTime),
        submission.language || '—',
        format(new Date(submission.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })
      ]);
      submissionRow.height = 25;
      submissionRow.eachCell((cell, colNumber) => {
        cell.font = {
          name: 'Arial',
          size: 11,
          color: { argb: '000000' }
        };
        if (colNumber === 1) {
          switch (submission.status.toLowerCase()) {
            case 'pending':
              cell.font.color = { argb: '0000FF' };
              break;
            case 'processing':
              cell.font.color = { argb: 'FFA500' };
              break;
            case 'accepted':
              cell.font.color = { argb: '008000' };
              break;
            case 'rejected':
              cell.font.color = { argb: 'FF0000' };
              break;
            case 'error':
              cell.font.color = { argb: 'FF6B00' };
              break;
          }
        }
      });
    });

    // Заполняем отчет по заявкам
    createSheetHeader(requestsStatsSheet, 'Общая статистика по заявкам', 2);
    requestsStatsSheet.columns = [{ width: 50 }, { width: 30 }];
    createTableHeader(requestsStatsSheet, ['Показатель', 'Значение']);
    const requestsStatsData = [
      ['Всего заявок', requestReport.totalRequests],
      ['На рассмотрении', requestReport.statusStats.pending],
      ['Одобрено', requestReport.statusStats.approved],
      ['Отклонено', requestReport.statusStats.rejected]
    ];
    requestsStatsData.forEach(row => {
      const dataRow = requestsStatsSheet.addRow(row);
      dataRow.height = 25;
      dataRow.getCell(1).font = { name: 'Arial', size: 11, color: { argb: '000000' } };
      dataRow.getCell(2).font = { name: 'Arial', size: 11, bold: true, color: { argb: '4E7AFF' } };
    });

    createSheetHeader(requestsHackathonsSheet, 'Статистика по хакатонам', 6);
    requestsHackathonsSheet.columns = [
      { width: 40 },
      { width: 30 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 }
    ];
    createTableHeader(requestsHackathonsSheet, [
      'Хакатон',
      'Даты проведения',
      'На рассмотрении',
      'Одобрено',
      'Отклонено',
      'Всего заявок'
    ]);
    requestReport.hackathonStats.forEach(hackathon => {
      const dates = `${format(new Date(hackathon.startDate), 'd MMM', { locale: ru })} - ${format(new Date(hackathon.endDate), 'd MMM yyyy', { locale: ru })}`;
      const hackathonRow = requestsHackathonsSheet.addRow([
        hackathon.title,
        dates,
        hackathon.stats.pending,
        hackathon.stats.approved,
        hackathon.stats.rejected,
        hackathon.stats.total
      ]);
      hackathonRow.height = 25;
      hackathonRow.eachCell((cell) => {
        cell.font = {
          name: 'Arial',
          size: 11,
          color: { argb: '000000' }
        };
      });
    });

    createSheetHeader(requestsListSheet, 'Последние заявки', 7);
    requestsListSheet.columns = [
      { width: 20 },
      { width: 30 },
      { width: 35 },
      { width: 40 },
      { width: 30 },
      { width: 20 },
      { width: 20 }
    ];
    createTableHeader(requestsListSheet, [
      'Статус',
      'Пользователь',
      'Email',
      'Хакатон',
      'Даты хакатона',
      'Регистрация',
      'Дата заявки'
    ]);
    requestReport.recentRequests.forEach(request => {
      const dates = `${format(new Date(request.hackathonStartDate), 'd MMM', { locale: ru })} - ${format(new Date(request.hackathonEndDate), 'd MMM yyyy', { locale: ru })}`;
      const requestRow = requestsListSheet.addRow([
        getRequestStatusText(request.status),
        request.userName,
        request.userEmail,
        request.hackathonTitle,
        dates,
        request.hackathonIsOpen ? 'Открыта' : 'Закрыта',
        format(new Date(request.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })
      ]);
      requestRow.height = 25;
      requestRow.eachCell((cell, colNumber) => {
        cell.font = {
          name: 'Arial',
          size: 11,
          color: { argb: '000000' }
        };
        if (colNumber === 1) {
          switch (request.status.toLowerCase()) {
            case 'pending':
              cell.font.color = { argb: '0000FF' };
              break;
            case 'approved':
              cell.font.color = { argb: '008000' };
              break;
            case 'rejected':
              cell.font.color = { argb: 'FF0000' };
              break;
          }
        }
        if (colNumber === 6) {
          cell.font.color = { argb: request.hackathonIsOpen ? '008000' : 'FF0000' };
        }
      });
    });

    // Добавляем границы для всех листов
    workbook.worksheets.forEach(sheet => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'E5E7EB' } },
            left: { style: 'thin', color: { argb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
            right: { style: 'thin', color: { argb: 'E5E7EB' } }
          };
        });
      });
    });

    // Сохраняем файл
    const date = format(new Date(), 'dd.MM.yyyy_HH-mm-ss', { locale: ru });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Общий_отчет_${date}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
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
        <Button
          onClick={exportAllReports}
          className="flex items-center gap-2 bg-[#4E7AFF] text-white hover:bg-[#4E7AFF]/90 transition-all duration-200"
        >
          <Download className="h-4 w-4" />
          Экспорт всех отчетов
        </Button>
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

  const exportToExcel = async (userReport: UserReport) => {
    const workbook = new Excel.Workbook();
    workbook.creator = 'Codigma';
    workbook.created = new Date();

    // Создаем лист с общей статистикой
    const statsSheet = workbook.addWorksheet('Общая статистика', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Устанавливаем ширину столбцов
    statsSheet.columns = [
      { width: 50 },
      { width: 30 }
    ];

    // Добавляем заголовок
    statsSheet.mergeCells('A1:B1');
    const titleRow = statsSheet.getRow(1);
    titleRow.height = 40;
    const titleCell = titleRow.getCell(1);
    titleCell.value = 'Общая статистика по пользователям';
    titleCell.font = {
      name: 'Arial',
      size: 16,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4E7AFF' }
    };
    titleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    // Добавляем пустую строку
    statsSheet.addRow([]);

    // Добавляем заголовки таблицы
    const headerRow = statsSheet.addRow(['Показатель', 'Значение']);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = {
        name: 'Arial',
        size: 12,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FA' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: '4E7AFF' } }
      };
    });

    // Добавляем данные
    const data = [
      ['Всего пользователей', userReport.totalUsers],
      ['Всего решено задач', userReport.taskStats.total],
      ['Среднее количество задач на пользователя', userReport.taskStats.average],
      ['Максимум решенных задач', userReport.taskStats.max],
      ['Всего участий в хакатонах', userReport.hackathonStats.total],
      ['Среднее количество хакатонов на пользователя', userReport.hackathonStats.average],
      ['Максимум участий в хакатонах', userReport.hackathonStats.max]
    ];

    data.forEach((row) => {
      const dataRow = statsSheet.addRow(row);
      dataRow.height = 25;
      dataRow.getCell(1).font = {
        name: 'Arial',
        size: 11,
        color: { argb: '000000' }
      };
      dataRow.getCell(2).font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      dataRow.eachCell((cell) => {
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } }
        };
      });
    });

    // Создаем лист с топом пользователей
    const usersSheet = workbook.addWorksheet('Топ пользователей', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Устанавливаем ширину столбцов
    usersSheet.columns = [
      { width: 40 },
      { width: 15 },
      { width: 20 },
      { width: 25 }
    ];

    // Добавляем заголовок
    usersSheet.mergeCells('A1:D1');
    const usersTitleRow = usersSheet.getRow(1);
    usersTitleRow.height = 40;
    const usersTitleCell = usersTitleRow.getCell(1);
    usersTitleCell.value = 'Топ пользователей';
    usersTitleCell.font = {
      name: 'Arial',
      size: 16,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    usersTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4E7AFF' }
    };
    usersTitleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    // Добавляем пустую строку
    usersSheet.addRow([]);

    // Добавляем заголовки таблицы
    const usersHeaderRow = usersSheet.addRow(['Пользователь', 'Баллы', 'Решено задач', 'Участие в хакатонах']);
    usersHeaderRow.height = 30;
    usersHeaderRow.eachCell((cell) => {
      cell.font = {
        name: 'Arial',
        size: 12,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FA' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: '4E7AFF' } }
      };
    });

    // Добавляем данные пользователей
    userReport.topUsers.forEach((user) => {
      const userRow = usersSheet.addRow([
        user.displayName,
        Number(user.totalScore.toFixed(1)),
        user.tasksCompleted,
        user.hackathonsParticipated
      ]);
      userRow.height = 25;
      userRow.eachCell((cell, colNumber) => {
        cell.font = {
          name: 'Arial',
          size: 11,
          color: colNumber === 2 ? { argb: '4E7AFF' } : { argb: '000000' },
          bold: colNumber === 2
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } }
        };
      });
    });

    // Добавляем границы для всех ячеек
    [statsSheet, usersSheet].forEach(sheet => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'E5E7EB' } },
            left: { style: 'thin', color: { argb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
            right: { style: 'thin', color: { argb: 'E5E7EB' } }
          };
        });
      });
    });

    // Сохраняем файл
    const date = format(new Date(), 'dd.MM.yyyy_HH-mm-ss', { locale: ru });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Отчет_по_пользователям_${date}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportHackathonsToExcel = async (hackathonReport: HackathonReport) => {
    const workbook = new Excel.Workbook();
    workbook.creator = 'Codigma';
    workbook.created = new Date();

    // Создаем лист с общей статистикой
    const statsSheet = workbook.addWorksheet('Общая статистика', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Устанавливаем ширину столбцов
    statsSheet.columns = [
      { width: 50 },
      { width: 30 }
    ];

    // Добавляем заголовок
    statsSheet.mergeCells('A1:B1');
    const titleRow = statsSheet.getRow(1);
    titleRow.height = 40;
    const titleCell = titleRow.getCell(1);
    titleCell.value = 'Общая статистика по хакатонам';
    titleCell.font = {
      name: 'Arial',
      size: 16,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4E7AFF' }
    };
    titleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    // Добавляем пустую строку
    statsSheet.addRow([]);

    // Добавляем заголовки таблицы
    const headerRow = statsSheet.addRow(['Показатель', 'Значение']);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = {
        name: 'Arial',
        size: 12,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FA' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: '4E7AFF' } }
      };
    });

    // Добавляем данные
    const data = [
      ['Всего хакатонов', hackathonReport.totalHackathons],
      ['Предстоящие хакатоны', hackathonReport.status.upcoming],
      ['Активные хакатоны', hackathonReport.status.active],
      ['Завершенные хакатоны', hackathonReport.status.completed],
      ['Открытые для регистрации', hackathonReport.status.active],
      ['Закрытые для регистрации', hackathonReport.status.completed]
    ];

    data.forEach((row) => {
      const dataRow = statsSheet.addRow(row);
      dataRow.height = 25;
      dataRow.getCell(1).font = {
        name: 'Arial',
        size: 11,
        color: { argb: '000000' }
      };
      dataRow.getCell(2).font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      dataRow.eachCell((cell) => {
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } }
        };
      });
    });

    // Создаем лист со списком хакатонов
    const hackathonsSheet = workbook.addWorksheet('Список хакатонов', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Устанавливаем ширину столбцов
    hackathonsSheet.columns = [
      { width: 40 }, // Название
      { width: 20 }, // Статус
      { width: 20 }, // Регистрация
      { width: 30 }, // Даты проведения
      { width: 15 }, // Участников
      { width: 15 }  // Средний балл
    ];

    // Добавляем заголовок
    hackathonsSheet.mergeCells('A1:F1');
    const hackathonsTitleRow = hackathonsSheet.getRow(1);
    hackathonsTitleRow.height = 40;
    const hackathonsTitleCell = hackathonsTitleRow.getCell(1);
    hackathonsTitleCell.value = 'Список хакатонов';
    hackathonsTitleCell.font = {
      name: 'Arial',
      size: 16,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    hackathonsTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4E7AFF' }
    };
    hackathonsTitleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    // Добавляем пустую строку
    hackathonsSheet.addRow([]);

    // Добавляем заголовки таблицы
    const hackathonsHeaderRow = hackathonsSheet.addRow([
      'Название',
      'Статус',
      'Регистрация',
      'Даты проведения',
      'Участников',
      'Средний балл'
    ]);
    hackathonsHeaderRow.height = 30;
    hackathonsHeaderRow.eachCell((cell) => {
      cell.font = {
        name: 'Arial',
        size: 12,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FA' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: '4E7AFF' } }
      };
    });

    // Добавляем данные хакатонов
    hackathonReport.hackathons.forEach((hackathon) => {
      const dates = `${format(new Date(hackathon.startDate), 'd MMM', { locale: ru })} - ${format(new Date(hackathon.endDate), 'd MMM yyyy', { locale: ru })}`;
      const status = getStatusText(hackathon.status);
      const registration = hackathon.isOpen ? "Открыта" : "Закрыта";

      const hackathonRow = hackathonsSheet.addRow([
        hackathon.title,
        status,
        registration,
        dates,
        hackathon.participantsCount,
        hackathon.averageScore.toFixed(1)
      ]);

      hackathonRow.height = 25;
      hackathonRow.eachCell((cell, colNumber) => {
        cell.font = {
          name: 'Arial',
          size: 11,
          color: colNumber === 5 ? { argb: '4E7AFF' } : { argb: '000000' },
          bold: colNumber === 5
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } }
        };
      });

      // Добавляем цветовое оформление для статуса
      const statusCell = hackathonRow.getCell(2);
      switch (hackathon.status) {
        case 'upcoming':
          statusCell.font.color = { argb: '0000FF' }; // Синий
          break;
        case 'active':
          statusCell.font.color = { argb: '008000' }; // Зеленый
          break;
        case 'completed':
          statusCell.font.color = { argb: '808080' }; // Серый
          break;
      }

      // Добавляем цветовое оформление для регистрации
      const registrationCell = hackathonRow.getCell(3);
      registrationCell.font.color = { argb: hackathon.isOpen ? '008000' : 'FF0000' };
    });

    // Добавляем границы для всех ячеек
    [statsSheet, hackathonsSheet].forEach(sheet => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'E5E7EB' } },
            left: { style: 'thin', color: { argb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
            right: { style: 'thin', color: { argb: 'E5E7EB' } }
          };
        });
      });
    });

    // Сохраняем файл
    const date = format(new Date(), 'dd.MM.yyyy_HH-mm-ss', { locale: ru });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Отчет_по_хакатонам_${date}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportTasksToExcel = async (taskReport: TaskReport) => {
    const workbook = new Excel.Workbook();
    workbook.creator = 'Codigma';
    workbook.created = new Date();

    // Создаем лист с общей статистикой
    const statsSheet = workbook.addWorksheet('Общая статистика', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Устанавливаем ширину столбцов
    statsSheet.columns = [
      { width: 50 },
      { width: 30 }
    ];

    // Добавляем заголовок
    statsSheet.mergeCells('A1:B1');
    const titleRow = statsSheet.getRow(1);
    titleRow.height = 40;
    const titleCell = titleRow.getCell(1);
    titleCell.value = 'Общая статистика по задачам';
    titleCell.font = {
      name: 'Arial',
      size: 16,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4E7AFF' }
    };
    titleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    // Добавляем пустую строку
    statsSheet.addRow([]);

    // Добавляем заголовки таблицы
    const headerRow = statsSheet.addRow(['Показатель', 'Значение']);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = {
        name: 'Arial',
        size: 12,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FA' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: '4E7AFF' } }
      };
    });

    // Добавляем данные
    const data = [
      ['Всего задач', taskReport.totalTasks],
      ['Легкие задачи', taskReport.difficulty.easy],
      ['Средние задачи', taskReport.difficulty.medium],
      ['Сложные задачи', taskReport.difficulty.hard],
      ['Минимум тест-кейсов', taskReport.testCases.min],
      ['Максимум тест-кейсов', taskReport.testCases.max],
      ['Среднее количество тест-кейсов', taskReport.testCases.average.toFixed(1)]
    ];

    data.forEach((row) => {
      const dataRow = statsSheet.addRow(row);
      dataRow.height = 25;
      dataRow.getCell(1).font = {
        name: 'Arial',
        size: 11,
        color: { argb: '000000' }
      };
      dataRow.getCell(2).font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      dataRow.eachCell((cell) => {
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } }
        };
      });
    });

    // Создаем лист с топом задач
    const tasksSheet = workbook.addWorksheet('Топ задач', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Устанавливаем ширину столбцов
    tasksSheet.columns = [
      { width: 50 }, // Название
      { width: 20 }, // Сложность
      { width: 25 }  // Тест-кейсы
    ];

    // Добавляем заголовок
    tasksSheet.mergeCells('A1:C1');
    const tasksTitleRow = tasksSheet.getRow(1);
    tasksTitleRow.height = 40;
    const tasksTitleCell = tasksTitleRow.getCell(1);
    tasksTitleCell.value = 'Топ задач по количеству тест-кейсов';
    tasksTitleCell.font = {
      name: 'Arial',
      size: 16,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    tasksTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4E7AFF' }
    };
    tasksTitleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    // Добавляем пустую строку
    tasksSheet.addRow([]);

    // Добавляем заголовки таблицы
    const tasksHeaderRow = tasksSheet.addRow([
      'Название задачи',
      'Сложность',
      'Количество тест-кейсов'
    ]);
    tasksHeaderRow.height = 30;
    tasksHeaderRow.eachCell((cell) => {
      cell.font = {
        name: 'Arial',
        size: 12,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FA' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: '4E7AFF' } }
      };
    });

    // Добавляем данные задач
    taskReport.topTasksByTestCases.forEach((task) => {
      const taskRow = tasksSheet.addRow([
        task.title,
        task.difficulty,
        task.testCasesCount
      ]);
      taskRow.height = 25;
      taskRow.eachCell((cell, colNumber) => {
        cell.font = {
          name: 'Arial',
          size: 11,
          color: colNumber === 2 ? { argb: '4E7AFF' } : { argb: '000000' },
          bold: colNumber === 2
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } }
        };
      });
    });

    // Добавляем границы для всех ячеек
    [statsSheet, tasksSheet].forEach(sheet => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'E5E7EB' } },
            left: { style: 'thin', color: { argb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
            right: { style: 'thin', color: { argb: 'E5E7EB' } }
          };
        });
      });
    });

    // Сохраняем файл
    const date = format(new Date(), 'dd.MM.yyyy_HH-mm-ss', { locale: ru });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Отчет_по_задачам_${date}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportSubmissionsToExcel = async (submissionReport: SubmissionReport) => {
    const workbook = new Excel.Workbook();
    workbook.creator = 'Codigma';
    workbook.created = new Date();

    // Создаем лист с общей статистикой
    const statsSheet = workbook.addWorksheet('Общая статистика', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Устанавливаем ширину столбцов
    statsSheet.columns = [
      { width: 50 },
      { width: 30 }
    ];

    // Добавляем заголовок
    statsSheet.mergeCells('A1:B1');
    const titleRow = statsSheet.getRow(1);
    titleRow.height = 40;
    const titleCell = titleRow.getCell(1);
    titleCell.value = 'Общая статистика по решениям';
    titleCell.font = {
      name: 'Arial',
      size: 16,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4E7AFF' }
    };
    titleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    // Добавляем пустую строку
    statsSheet.addRow([]);

    // Добавляем заголовки таблицы
    const headerRow = statsSheet.addRow(['Показатель', 'Значение']);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = {
        name: 'Arial',
        size: 12,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FA' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: '4E7AFF' } }
      };
    });

    // Добавляем данные
    const data = [
      ['Всего решений', submissionReport.totalSubmissions],
      ['Ожидают проверки', submissionReport.statusStats.pending],
      ['В обработке', submissionReport.statusStats.processing],
      ['Принято', submissionReport.statusStats.accepted],
      ['Отклонено', submissionReport.statusStats.rejected],
      ['Ошибка', submissionReport.statusStats.error],
      ['Процент успешных тестов', `${submissionReport.performanceStats.testsPassedPercent.toFixed(1)}%`],
      ['Минимальное использование памяти', formatBytes(submissionReport.performanceStats.memory.min)],
      ['Максимальное использование памяти', formatBytes(submissionReport.performanceStats.memory.max)],
      ['Среднее использование памяти', formatBytes(submissionReport.performanceStats.memory.average)],
      ['Минимальное время выполнения', formatTime(submissionReport.performanceStats.executionTime.min)],
      ['Максимальное время выполнения', formatTime(submissionReport.performanceStats.executionTime.max)],
      ['Среднее время выполнения', formatTime(submissionReport.performanceStats.executionTime.average)]
    ];

    data.forEach((row) => {
      const dataRow = statsSheet.addRow(row);
      dataRow.height = 25;
      dataRow.getCell(1).font = {
        name: 'Arial',
        size: 11,
        color: { argb: '000000' }
      };
      dataRow.getCell(2).font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      dataRow.eachCell((cell) => {
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } }
        };
      });
    });

    // Создаем лист с последними решениями
    const submissionsSheet = workbook.addWorksheet('Последние решения', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Устанавливаем ширину столбцов
    submissionsSheet.columns = [
      { width: 15 }, // Статус
      { width: 40 }, // Задача
      { width: 30 }, // Пользователь
      { width: 30 }, // Хакатон
      { width: 20 }, // Тесты
      { width: 25 }, // Память
      { width: 25 }, // Время
      { width: 15 }, // Язык
      { width: 20 }  // Дата
    ];

    // Добавляем заголовок
    submissionsSheet.mergeCells('A1:I1');
    const submissionsTitleRow = submissionsSheet.getRow(1);
    submissionsTitleRow.height = 40;
    const submissionsTitleCell = submissionsTitleRow.getCell(1);
    submissionsTitleCell.value = 'Последние решения';
    submissionsTitleCell.font = {
      name: 'Arial',
      size: 16,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    submissionsTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4E7AFF' }
    };
    submissionsTitleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    // Добавляем пустую строку
    submissionsSheet.addRow([]);

    // Добавляем заголовки таблицы
    const submissionsHeaderRow = submissionsSheet.addRow([
      'Статус',
      'Задача',
      'Пользователь',
      'Хакатон',
      'Тесты',
      'Память',
      'Время',
      'Язык',
      'Дата'
    ]);
    submissionsHeaderRow.height = 30;
    submissionsHeaderRow.eachCell((cell) => {
      cell.font = {
        name: 'Arial',
        size: 12,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FA' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: '4E7AFF' } }
      };
    });

    // Добавляем данные решений
    submissionReport.recentSubmissions.forEach((submission) => {
      const submissionRow = submissionsSheet.addRow([
        submission.status,
        submission.taskTitle,
        submission.userName,
        submission.hackathonTitle || '—',
        `${submission.testsPassed}/${submission.testsTotal} (${submission.passedPercent.toFixed(1)}%)`,
        formatBytes(submission.memory),
        formatTime(submission.executionTime),
        submission.language || '—',
        format(new Date(submission.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })
      ]);

      submissionRow.height = 25;
      submissionRow.eachCell((cell, colNumber) => {
        cell.font = {
          name: 'Arial',
          size: 11,
          color: { argb: '000000' }
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } }
        };
      });

      // Добавляем цветовое оформление для статуса
      const statusCell = submissionRow.getCell(1);
      switch (submission.status.toLowerCase()) {
        case 'pending':
          statusCell.font.color = { argb: '0000FF' }; // Синий
          break;
        case 'processing':
          statusCell.font.color = { argb: 'FFA500' }; // Оранжевый
          break;
        case 'accepted':
          statusCell.font.color = { argb: '008000' }; // Зеленый
          break;
        case 'rejected':
          statusCell.font.color = { argb: 'FF0000' }; // Красный
          break;
        case 'error':
          statusCell.font.color = { argb: 'FF6B00' }; // Оранжево-красный
          break;
      }
    });

    // Добавляем границы для всех ячеек
    [statsSheet, submissionsSheet].forEach(sheet => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'E5E7EB' } },
            left: { style: 'thin', color: { argb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
            right: { style: 'thin', color: { argb: 'E5E7EB' } }
          };
        });
      });
    });

    // Сохраняем файл
    const date = format(new Date(), 'dd.MM.yyyy_HH-mm-ss', { locale: ru });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Отчет_по_решениям_${date}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportRequestsToExcel = async (requestReport: RequestReport) => {
    const workbook = new Excel.Workbook();
    workbook.creator = 'Codigma';
    workbook.created = new Date();

    // Создаем лист с общей статистикой
    const statsSheet = workbook.addWorksheet('Общая статистика', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Устанавливаем ширину столбцов
    statsSheet.columns = [
      { width: 50 },
      { width: 30 }
    ];

    // Добавляем заголовок
    statsSheet.mergeCells('A1:B1');
    const titleRow = statsSheet.getRow(1);
    titleRow.height = 40;
    const titleCell = titleRow.getCell(1);
    titleCell.value = 'Общая статистика по заявкам';
    titleCell.font = {
      name: 'Arial',
      size: 16,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4E7AFF' }
    };
    titleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    // Добавляем пустую строку
    statsSheet.addRow([]);

    // Добавляем заголовки таблицы
    const headerRow = statsSheet.addRow(['Показатель', 'Значение']);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = {
        name: 'Arial',
        size: 12,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FA' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: '4E7AFF' } }
      };
    });

    // Добавляем данные
    const data = [
      ['Всего заявок', requestReport.totalRequests],
      ['На рассмотрении', requestReport.statusStats.pending],
      ['Одобрено', requestReport.statusStats.approved],
      ['Отклонено', requestReport.statusStats.rejected]
    ];

    data.forEach((row) => {
      const dataRow = statsSheet.addRow(row);
      dataRow.height = 25;
      dataRow.getCell(1).font = {
        name: 'Arial',
        size: 11,
        color: { argb: '000000' }
      };
      dataRow.getCell(2).font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      dataRow.eachCell((cell) => {
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } }
        };
      });
    });

    // Создаем лист со статистикой по хакатонам
    const hackathonsSheet = workbook.addWorksheet('Статистика по хакатонам со статусом "закрыт"', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Устанавливаем ширину столбцов
    hackathonsSheet.columns = [
      { width: 40 }, // Хакатон
      { width: 30 }, // Даты проведения
      { width: 20 }, // На рассмотрении
      { width: 20 }, // Одобрено
      { width: 20 }, // Отклонено
      { width: 20 }  // Всего заявок
    ];

    // Добавляем заголовок
    hackathonsSheet.mergeCells('A1:F1');
    const hackathonsTitleRow = hackathonsSheet.getRow(1);
    hackathonsTitleRow.height = 40;
    const hackathonsTitleCell = hackathonsTitleRow.getCell(1);
    hackathonsTitleCell.value = 'Статистика по хакатонам со статусом "закрыт"';
    hackathonsTitleCell.font = {
      name: 'Arial',
      size: 16,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    hackathonsTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4E7AFF' }
    };
    hackathonsTitleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    // Добавляем пустую строку
    hackathonsSheet.addRow([]);

    // Добавляем заголовки таблицы
    const hackathonsHeaderRow = hackathonsSheet.addRow([
      'Хакатон',
      'Даты проведения',
      'На рассмотрении',
      'Одобрено',
      'Отклонено',
      'Всего заявок'
    ]);
    hackathonsHeaderRow.height = 30;
    hackathonsHeaderRow.eachCell((cell) => {
      cell.font = {
        name: 'Arial',
        size: 12,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FA' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: '4E7AFF' } }
      };
    });

    // Добавляем данные хакатонов
    requestReport.hackathonStats.forEach((hackathon) => {
      const dates = `${format(new Date(hackathon.startDate), 'd MMM', { locale: ru })} - ${format(new Date(hackathon.endDate), 'd MMM yyyy', { locale: ru })}`;
      
      const hackathonRow = hackathonsSheet.addRow([
        hackathon.title,
        dates,
        hackathon.stats.pending,
        hackathon.stats.approved,
        hackathon.stats.rejected,
        hackathon.stats.total
      ]);

      hackathonRow.height = 25;
      hackathonRow.eachCell((cell, colNumber) => {
        cell.font = {
          name: 'Arial',
          size: 11,
          color: { argb: '000000' }
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } }
        };
      });
    });

    // Создаем лист с последними заявками
    const requestsSheet = workbook.addWorksheet('Последние заявки', {
      properties: { tabColor: { argb: '4E7AFF' } }
    });

    // Устанавливаем ширину столбцов
    requestsSheet.columns = [
      { width: 20 }, // Статус
      { width: 30 }, // Пользователь
      { width: 35 }, // Email
      { width: 40 }, // Хакатон
      { width: 30 }, // Даты хакатона
      { width: 20 }, // Регистрация
      { width: 20 }  // Дата заявки
    ];

    // Добавляем заголовок
    requestsSheet.mergeCells('A1:G1');
    const requestsTitleRow = requestsSheet.getRow(1);
    requestsTitleRow.height = 40;
    const requestsTitleCell = requestsTitleRow.getCell(1);
    requestsTitleCell.value = 'Последние заявки';
    requestsTitleCell.font = {
      name: 'Arial',
      size: 16,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    requestsTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4E7AFF' }
    };
    requestsTitleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };

    // Добавляем пустую строку
    requestsSheet.addRow([]);

    // Добавляем заголовки таблицы
    const requestsHeaderRow = requestsSheet.addRow([
      'Статус',
      'Пользователь',
      'Email',
      'Хакатон',
      'Даты хакатона',
      'Регистрация',
      'Дата заявки'
    ]);
    requestsHeaderRow.height = 30;
    requestsHeaderRow.eachCell((cell) => {
      cell.font = {
        name: 'Arial',
        size: 12,
        bold: true,
        color: { argb: '4E7AFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FA' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: '4E7AFF' } }
      };
    });

    // Добавляем данные заявок
    requestReport.recentRequests.forEach((request) => {
      const dates = `${format(new Date(request.hackathonStartDate), 'd MMM', { locale: ru })} - ${format(new Date(request.hackathonEndDate), 'd MMM yyyy', { locale: ru })}`;
      
      const requestRow = requestsSheet.addRow([
        getRequestStatusText(request.status),
        request.userName,
        request.userEmail,
        request.hackathonTitle,
        dates,
        request.hackathonIsOpen ? 'Открыта' : 'Закрыта',
        format(new Date(request.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })
      ]);

      requestRow.height = 25;
      requestRow.eachCell((cell, colNumber) => {
        cell.font = {
          name: 'Arial',
          size: 11,
          color: { argb: '000000' }
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } }
        };
      });

      // Добавляем цветовое оформление для статуса
      const statusCell = requestRow.getCell(1);
      switch (request.status.toLowerCase()) {
        case 'pending':
          statusCell.font.color = { argb: '0000FF' }; // Синий
          break;
        case 'approved':
          statusCell.font.color = { argb: '008000' }; // Зеленый
          break;
        case 'rejected':
          statusCell.font.color = { argb: 'FF0000' }; // Красный
          break;
      }

      // Добавляем цветовое оформление для регистрации
      const registrationCell = requestRow.getCell(6);
      registrationCell.font.color = { argb: request.hackathonIsOpen ? '008000' : 'FF0000' };
    });

    // Добавляем границы для всех ячеек
    [statsSheet, hackathonsSheet, requestsSheet].forEach(sheet => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'E5E7EB' } },
            left: { style: 'thin', color: { argb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
            right: { style: 'thin', color: { argb: 'E5E7EB' } }
          };
        });
      });
    });

    // Сохраняем файл
    const date = format(new Date(), 'dd.MM.yyyy_HH-mm-ss', { locale: ru });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Отчет_по_заявкам_${date}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const renderUsersReport = () => (
    <>
      <div className="flex items-center justify-between mb-8">
        <ReportHeader 
          icon={Users} 
          title="Отчет по пользователям" 
          onBack={() => setActiveReport(null)} 
        />
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setActiveReport(null)}
            variant="outline"
            className="flex items-center gap-2 transition-all duration-200 hover:bg-[#4E7AFF]/5 hover:text-[#4E7AFF] hover:border-[#4E7AFF]"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </Button>
          <Button
            onClick={() => exportToExcel(userReport)}
            className="flex items-center gap-2 bg-[#4E7AFF] text-white hover:bg-[#4E7AFF]/90 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            Экспорт в Excel
          </Button>
        </div>
      </div>

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
      <div className="flex items-center justify-between mb-8">
        <ReportHeader 
          icon={Trophy} 
          title="Отчет по хакатонам" 
          onBack={() => setActiveReport(null)} 
        />
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setActiveReport(null)}
            variant="outline"
            className="flex items-center gap-2 transition-all duration-200 hover:bg-[#4E7AFF]/5 hover:text-[#4E7AFF] hover:border-[#4E7AFF]"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </Button>
          <Button
            onClick={() => exportHackathonsToExcel(hackathonReport)}
            className="flex items-center gap-2 bg-[#4E7AFF] text-white hover:bg-[#4E7AFF]/90 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            Экспорт в Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Всего хакатонов" icon={Trophy}>
          <div className="text-2xl font-bold">{hackathonReport.totalHackathons}</div>
        </StatsCard>

        <StatsCard title="Статус регистрации" icon={Lock}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-[#4E7AFF]">Открытые</div>
              <div className="text-2xl font-bold">{hackathonReport.status.active}</div>
            </div>
            <div>
              <div className="text-sm text-red-500">Закрытые</div>
              <div className="text-2xl font-bold">{hackathonReport.status.completed}</div>
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
            totalPages={hackathonReport.hackathons.length}
            onPrevPage={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            onNextPage={() => setCurrentPage(prev => Math.min(hackathonReport.hackathons.length, prev + 1))}
          />
        </CardContent>
      </DataTable>
    </>
  );

  const renderTasksReport = () => (
    <>
      <div className="flex items-center justify-between mb-8">
        <ReportHeader 
          icon={Code} 
          title="Отчет по задачам" 
          onBack={() => setActiveReport(null)} 
        />
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setActiveReport(null)}
            variant="outline"
            className="flex items-center gap-2 transition-all duration-200 hover:bg-[#4E7AFF]/5 hover:text-[#4E7AFF] hover:border-[#4E7AFF]"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </Button>
          <Button
            onClick={() => exportTasksToExcel(taskReport)}
            className="flex items-center gap-2 bg-[#4E7AFF] text-white hover:bg-[#4E7AFF]/90 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            Экспорт в Excel
          </Button>
        </div>
      </div>

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
      <div className="flex items-center justify-between mb-8">
        <ReportHeader 
          icon={Send} 
          title="Отчет по решениям" 
          onBack={() => setActiveReport(null)} 
        />
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setActiveReport(null)}
            variant="outline"
            className="flex items-center gap-2 transition-all duration-200 hover:bg-[#4E7AFF]/5 hover:text-[#4E7AFF] hover:border-[#4E7AFF]"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </Button>
          <Button
            onClick={() => exportSubmissionsToExcel(submissionReport)}
            className="flex items-center gap-2 bg-[#4E7AFF] text-white hover:bg-[#4E7AFF]/90 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            Экспорт в Excel
          </Button>
        </div>
      </div>

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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <ReportHeader
          icon={Send}
          title="Отчет по заявкам"
          onBack={() => setActiveReport(null)}
        />
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setActiveReport(null)}
            variant="outline"
            className="flex items-center gap-2 transition-all duration-200 hover:bg-[#4E7AFF]/5 hover:text-[#4E7AFF] hover:border-[#4E7AFF]"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </Button>
          <Button
            onClick={() => requestReport && exportRequestsToExcel(requestReport)}
            className="flex items-center gap-2 bg-[#4E7AFF] text-white hover:bg-[#4E7AFF]/90 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            Экспорт в Excel
          </Button>
        </div>
      </div>

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
    </div>
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