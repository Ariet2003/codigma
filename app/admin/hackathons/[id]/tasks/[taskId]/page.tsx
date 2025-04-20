"use client";

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown';
import { Code, Trophy, Clock, Info, ChevronLeft, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

async function getTask(taskId: string) {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error('Error fetching task:', await response.text());
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching task:', error);
    return null;
  }
}

async function getTaskSubmissions(taskId: string, hackathonId: string) {
  try {
    const response = await fetch(
      `/api/tasks/${taskId}/submissions?hackathonId=${hackathonId}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('Error fetching submissions:', await response.text());
      return {
        avgExecutionTime: 0,
        avgMemory: 0,
        correctSolutions: 0,
        wrongSolutions: 0,
        totalSubmissions: 0
      };
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return {
      avgExecutionTime: 0,
      avgMemory: 0,
      correctSolutions: 0,
      wrongSolutions: 0,
      totalSubmissions: 0
    };
  }
}

export default function TaskDetailsPage({
  params,
}: {
  params: { id: string; taskId: string };
}) {
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any>({
    avgExecutionTime: 0,
    avgMemory: 0,
    correctSolutions: 0,
    wrongSolutions: 0,
    totalSubmissions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const taskData = await getTask(params.taskId);
        if (!taskData) {
          return;
        }
        setTask(taskData);
        const submissionsData = await getTaskSubmissions(params.taskId, params.id);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.taskId, params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Задача не найдена</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Основная информация */}
      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-transparent"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Code className="w-8 h-8 text-[#4E7AFF]" />
              {task.title}
            </h1>
          </div>
          <div className="prose max-w-none dark:prose-invert">
            <Markdown>{task.description}</Markdown>
          </div>
        </CardContent>
      </Card>

      {/* Информация о задаче */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Info className="w-6 h-6 text-[#4E7AFF]" />
            Информация
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Сложность</p>
                <p className="font-medium">{task.difficulty}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Среднее время выполнения</p>
                <p className="font-medium">{submissions.avgExecutionTime} мс</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Среднее использование памяти</p>
                <p className="font-medium">{submissions.avgMemory} Б</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика решений */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#4E7AFF]" />
            Статистика решений
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Правильных решений</p>
                <p className="font-medium">{submissions.correctSolutions || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Неправильных решений</p>
                <p className="font-medium">{submissions.wrongSolutions || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Всего отправлено решений</p>
                <p className="font-medium">{submissions.totalSubmissions || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 