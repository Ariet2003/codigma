'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Search, User, Mail, Calendar, Trophy, Users, CheckCircle2, XCircle, SortAsc, SortDesc } from 'lucide-react';

type Participant = {
  id: string;
  user: {
    name: string;
    email: string;
  };
  joinedAt: string;
  totalScore: number;
  solvedCount: number;
  failedCount: number;
  correctSolutions: number;
  wrongSolutions: number;
};

type SortField = 'name' | 'joinedAt' | 'totalScore' | 'correctSolutions' | 'wrongSolutions';
type SortOrder = 'asc' | 'desc';
type ScoreFilter = 'all' | 'high' | 'medium' | 'low';

export default function ParticipantsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<SortField>('joinedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort: sortField,
        order: sortOrder,
        scoreFilter,
        ...(search && { search }),
      });

      const response = await fetch(`/api/hackathons/${params.id}/participants?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch participants');
      
      const data = await response.json();
      setParticipants(data.participants);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список участников',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchParticipants();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, page, sortField, sortOrder, scoreFilter]);

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-7 h-7 text-[#4E7AFF]" />
            <span className="text-[#4E7AFF]">Участники хакатона</span>
          </h1>
          <Button onClick={() => router.push(`/admin/hackathons/${params.id}`)}>
            Назад к хакатону
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по ФИО или email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Сортировать по" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">ФИО</SelectItem>
              <SelectItem value="joinedAt">Дате регистрации</SelectItem>
              <SelectItem value="totalScore">Баллам</SelectItem>
              <SelectItem value="correctSolutions">Правильным решениям</SelectItem>
              <SelectItem value="wrongSolutions">Неправильным решениям</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>

          <Select value={scoreFilter} onValueChange={(value) => setScoreFilter(value as ScoreFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр по баллам" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все участники</SelectItem>
              <SelectItem value="high">Высокий балл</SelectItem>
              <SelectItem value="medium">Средний балл</SelectItem>
              <SelectItem value="low">Низкий балл</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="h-4 bg-muted rounded"></div>
              </Card>
            ))}
          </div>
        ) : participants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((participant) => (
              <Card key={participant.id} className="p-4 hover:border-[#4E7AFF] transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-[#4E7AFF]" />
                      <p className="font-medium">{participant.user.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm font-medium text-green-500">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {participant.correctSolutions || 0}
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-red-500">
                        <XCircle className="w-4 h-4 text-red-500" />
                        {participant.wrongSolutions || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-muted-foreground">{participant.user.email}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">
                        {format(new Date(participant.joinedAt), 'dd.MM.yyyy', { locale: ru })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-[#4E7AFF]">{participant.totalScore}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Участники не найдены</p>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Назад
            </Button>
            <span className="py-2 px-4">
              Страница {page} из {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Вперед
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 