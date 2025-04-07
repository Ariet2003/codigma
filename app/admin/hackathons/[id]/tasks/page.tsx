'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Search, SortAsc, SortDesc, List, CheckCircle2 } from 'lucide-react';
import Markdown from 'react-markdown';

type Task = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  solvedCount: number;
};

type SortField = 'title' | 'difficulty' | 'points' | 'solvedCount';
type SortOrder = 'asc' | 'desc';
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

export default function TasksPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams({
        page: page.toString(),
        sort: sortField,
        order: sortOrder,
        difficulty,
        ...(search && { search }),
      });

      const response = await fetch(`/api/hackathons/${params.id}/tasks?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data = await response.json();
      setTasks(data.tasks);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить задачи',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, sortField, sortOrder, difficulty, search]);

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <List className="w-7 h-7 text-[#4E7AFF]" />
            <span className="text-[#4E7AFF]">Задачи хакатона</span>
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
                placeholder="Поиск задач..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Сортировать по" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Названию</SelectItem>
              <SelectItem value="difficulty">Сложности</SelectItem>
              <SelectItem value="solvedCount">Кол-ву решений</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>

          <Select value={difficulty} onValueChange={(value) => setDifficulty(value as DifficultyFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Сложность" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="easy">Легкие</SelectItem>
              <SelectItem value="medium">Средние</SelectItem>
              <SelectItem value="hard">Сложные</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="h-4 bg-muted rounded"></div>
              </Card>
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className="p-4 hover:border-[#4E7AFF] transition-colors cursor-pointer"
                onClick={() => router.push(`/admin/hackathons/${params.id}/tasks/${task.id}`)}
              >
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className={`text-sm font-medium ${
                      task.difficulty === 'easy' ? 'text-green-500' :
                      task.difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {task.difficulty === 'easy' && 'Легкая'}
                      {task.difficulty === 'medium' && 'Средняя'}
                      {task.difficulty === 'hard' && 'Сложная'}
                    </span>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-500">
                      <CheckCircle2 className="w-4 h-4" />
                      {task.solvedCount}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Задачи не найдены</p>
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