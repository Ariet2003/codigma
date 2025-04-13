"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Cpu, Timer, Code2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

type Submission = {
  id: string;
  createdAt: string;
  status: string;
  language: string;
  memory: number | null;
  executionTime: number | null;
  code: string;
};

export default function SubmissionsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`/api/u/tasks/${id}/submissions`);
        if (!response.ok) throw new Error('Failed to fetch submissions');
        const data = await response.json();
        setSubmissions(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'text-green-500';
      case 'WRONG_ANSWER':
        return 'text-red-500';
      case 'TIME_LIMIT':
        return 'text-yellow-500';
      case 'MEMORY_LIMIT':
        return 'text-orange-500';
      case 'RUNTIME_ERROR':
        return 'text-purple-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'WRONG_ANSWER':
        return <XCircle className="w-5 h-5" />;
      case 'TIME_LIMIT':
        return <Timer className="w-5 h-5" />;
      case 'MEMORY_LIMIT':
        return <Cpu className="w-5 h-5" />;
      case 'RUNTIME_ERROR':
        return <RefreshCcw className="w-5 h-5" />;
      default:
        return <Code2 className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'Успешно';
      case 'WRONG_ANSWER':
        return 'Неверный ответ';
      case 'TIME_LIMIT':
        return 'Превышен лимит времени';
      case 'MEMORY_LIMIT':
        return 'Превышен лимит памяти';
      case 'RUNTIME_ERROR':
        return 'Ошибка выполнения';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/u/tasks/${id}`)}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            К задаче
          </Button>
          <h1 className="text-2xl font-bold">История решений</h1>
        </div>
      </div>

      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Нет отправленных решений</div>
          </div>
        ) : (
          submissions.map((submission) => (
            <div
              key={submission.id}
              className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("flex items-center gap-2", getStatusColor(submission.status))}>
                    {getStatusIcon(submission.status)}
                    <span className="font-medium">{getStatusText(submission.status)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 inline-block mr-1" />
                    {format(new Date(submission.createdAt), 'dd MMMM yyyy, HH:mm:ss', { locale: ru })}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Cpu className="w-4 h-4" />
                      {submission.memory ? `${submission.memory} KB` : '—'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Timer className="w-4 h-4" />
                      {submission.executionTime ? `${submission.executionTime} мс` : '—'}
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-muted">
                    {submission.language}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 