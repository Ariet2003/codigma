'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUpDown, Trophy, Medal, Target, Send, Crown, Award, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Participant = {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  totalScore: number;
  solvedTasksCount: number;
  totalSubmissions: number;
  averageAttempts: number;
};

export default function RatingPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sortBy, setSortBy] = useState<string>('totalScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchRating();
  }, [params.id]);

  const fetchRating = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hackathons/${params.id}/rating`);
      if (!response.ok) throw new Error('Failed to fetch rating');
      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      console.error('Error fetching rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortParticipants = (field: string) => {
    const newOrder = field === sortBy && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    setSortBy(field);

    const sorted = [...participants].sort((a, b) => {
      let comparison = 0;
      if (field === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (field === 'joinedAt') {
        comparison = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      } else if (field === 'totalScore') {
        comparison = a.totalScore - b.totalScore;
      } else if (field === 'solvedTasksCount') {
        comparison = a.solvedTasksCount - b.solvedTasksCount;
      } else if (field === 'totalSubmissions') {
        comparison = a.totalSubmissions - b.totalSubmissions;
      }
      return newOrder === 'asc' ? comparison : -comparison;
    });

    setParticipants(sorted);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'desc' ? '↓' : '↑';
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg text-muted-foreground">Загрузка рейтинга...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Рейтинг участников
          </h1>
          <p className="text-muted-foreground mt-1">
            Сравнительная статистика участников хакатона
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2 hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к хакатону
        </Button>
      </div>

      {/* Карточки с общей статистикой */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Участников</p>
                <h3 className="text-2xl font-bold mt-1">{participants.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Всего решений</p>
                <h3 className="text-2xl font-bold mt-1">
                  {participants.reduce((sum, p) => sum + p.totalSubmissions, 0)}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Решено задач</p>
                <h3 className="text-2xl font-bold mt-1">
                  {participants.reduce((sum, p) => sum + p.solvedTasksCount, 0)}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Общий балл</p>
                <h3 className="text-2xl font-bold mt-1">
                  {participants.reduce((sum, p) => sum + p.totalScore, 0).toFixed(1)}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <Medal className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Таблица рейтинга */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Таблица рейтинга</CardTitle>
          <CardDescription className="flex items-center gap-2">
            Сортировка: {' '}
            <Select value={sortBy} onValueChange={(value) => sortParticipants(value)}>
              <SelectTrigger className="w-[210px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalScore">По общему баллу</SelectItem>
                <SelectItem value="solvedTasksCount">По решённым задачам</SelectItem>
                <SelectItem value="totalSubmissions">По числу отправок</SelectItem>
                <SelectItem value="name">По имени</SelectItem>
              </SelectContent>
            </Select>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center font-semibold">#</TableHead>
                  <TableHead className="text-center font-semibold">
                    <Button 
                      variant="ghost" 
                      onClick={() => sortParticipants('name')}
                      className="flex items-center gap-2 hover:bg-primary/10"
                    >
                      Участник {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center font-semibold">Email</TableHead>
                  <TableHead className="text-center font-semibold">
                    <Button 
                      variant="ghost" 
                      onClick={() => sortParticipants('joinedAt')}
                      className="flex items-center gap-2 hover:bg-primary/10"
                    >
                      Присоединился {getSortIcon('joinedAt')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    <Button 
                      variant="ghost" 
                      onClick={() => sortParticipants('totalScore')}
                      className="flex items-center gap-2 hover:bg-primary/10"
                    >
                      Общий балл {getSortIcon('totalScore')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    <Button 
                      variant="ghost" 
                      onClick={() => sortParticipants('solvedTasksCount')}
                      className="flex items-center gap-2 hover:bg-primary/10"
                    >
                      Решено задач {getSortIcon('solvedTasksCount')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    <Button 
                      variant="ghost" 
                      onClick={() => sortParticipants('totalSubmissions')}
                      className="flex items-center gap-2 hover:bg-primary/10"
                    >
                      Отправок {getSortIcon('totalSubmissions')}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant, index) => (
                  <TableRow 
                    key={participant.id}
                    className={index < 3 ? "bg-gradient-to-r from-primary/5 to-primary/10" : "hover:bg-muted/50"}
                  >
                    <TableCell className="text-center font-medium">
                      {index < 3 ? (
                        <div className="flex items-center justify-center">
                          {index === 0 ? (
                            <div className="relative">
                              <Medal className="h-6 w-6 text-amber-500" />
                              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-amber-900">1</span>
                            </div>
                          ) : index === 1 ? (
                            <div className="relative">
                              <Medal className="h-6 w-6 text-slate-400" />
                              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-slate-900">2</span>
                            </div>
                          ) : (
                            <div className="relative">
                              <Medal className="h-6 w-6 text-amber-700" />
                              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-amber-900">3</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        index + 1
                      )}
                    </TableCell>
                    <TableCell className="text-center font-medium">{participant.name}</TableCell>
                    <TableCell className="text-center">{participant.email}</TableCell>
                    <TableCell className="text-center">
                      {participant.joinedAt ? format(new Date(participant.joinedAt), 'dd MMM yyyy HH:mm', { locale: ru }) : 'Нет данных'}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {participant.totalScore}
                    </TableCell>
                    <TableCell className="text-center">
                      {participant.solvedTasksCount}
                    </TableCell>
                    <TableCell className="text-center">
                      {participant.totalSubmissions}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Показано {participants.length} из {participants.length} записей
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 