import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown';
import { Code, Trophy, Clock, Info, ChevronLeft, CheckCircle2, XCircle } from 'lucide-react';

async function getTask(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tasks/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch task');
  }

  return response.json();
}

async function getTaskSubmissions(taskId: string, hackathonId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/tasks/${taskId}/submissions?hackathonId=${hackathonId}`,
    {
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }

  return response.json();
}

export default async function TaskDetailsPage({
  params,
}: {
  params: { id: string; taskId: string };
}) {
  const task = await getTask(params.taskId);
  if (!task) {
    notFound();
  }

  const submissions = await getTaskSubmissions(params.taskId, params.id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Основная информация */}
      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hover:bg-transparent"
            >
              <Link href={`/admin/hackathons/${params.id}/tasks`}>
                <ChevronLeft className="w-6 h-6" />
              </Link>
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
                <p className="font-medium">{submissions.avgMemory} КБ</p>
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