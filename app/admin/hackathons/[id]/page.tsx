'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown';
import { Calendar, Users, Trophy, Clock, Info, List, ChevronRight, CalendarCheck, CalendarCheck2Icon, CalendarHeart, CalendarRange, CalendarX, CalendarDaysIcon, UserPlus, BarChart3, FileText, BarChart2 } from 'lucide-react';
import HackathonTimer from '@/components/ui/hackathon-timer';
import { useRouter } from 'next/navigation';

export default function HackathonDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [hackathon, setHackathon] = useState<any>(null);
  const [participants, setParticipants] = useState<any>({ participants: [] });
  const [loading, setLoading] = useState(true);

  const fetchHackathonData = async () => {
    try {
      setLoading(true);
      
      // Получаем данные о хакатоне
      const hackathonResponse = await fetch(`/api/hackathons/${params.id}`, {
        cache: 'no-store',
      });
      
      if (!hackathonResponse.ok) {
        if (hackathonResponse.status === 404) {
          notFound();
        }
        throw new Error('Failed to fetch hackathon');
      }
      
      const hackathonData = await hackathonResponse.json();
      setHackathon(hackathonData);
      
      // Получаем данные об участниках
      const participantsResponse = await fetch(`/api/hackathons/${params.id}/participants`, {
        cache: 'no-store',
      });
      
      if (!participantsResponse.ok) {
        throw new Error('Failed to fetch participants');
      }
      
      const participantsData = await participantsResponse.json();
      setParticipants(participantsData);
    } catch (error) {
      console.error('Error fetching hackathon data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    fetchHackathonData();
  }, [params.id]);

  // Обработчик для обновления данных при возврате через стрелки браузера
  useEffect(() => {
    const handlePopState = () => {
      fetchHackathonData();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hackathon) {
    return null;
  }

  const isHackathonEnded = new Date(hackathon.endDate) < new Date();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Основная информация */}
      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-[#4E7AFF]" />
            {hackathon.title}
          </h1>
          <div className="prose max-w-none dark:prose-invert">
            <Markdown>{hackathon.description}</Markdown>
          </div>
        </CardContent>
      </Card>

      {/* Таймер хакатона */}
      <div className="md:col-span-2">
        <HackathonTimer startDate={hackathon.startDate} endDate={hackathon.endDate} />
      </div>

      {/* Даты */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-[#4E7AFF]" />
            Даты
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Дата начала</p>
                <p className="font-medium">
                  {format(new Date(hackathon.startDate), 'PPp', { locale: ru })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Дата окончания</p>
                <p className="font-medium">
                  {format(new Date(hackathon.endDate), 'PPp', { locale: ru })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Дата создания</p>
                <p className="font-medium">
                  {format(new Date(hackathon.createdAt), 'PPp', { locale: ru })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Информация о хакатоне */}
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
                <p className="text-sm text-muted-foreground">Тип хакатона</p>
                <p className="font-medium">{hackathon.isOpen ? 'Открытый' : 'Закрытый'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-sm text-muted-foreground">Количество участников</p>
                <p className="font-medium">{participants.participants.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Кнопки навигации */}
      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <Button
              variant="outline"
              className="flex-1 min-w-[200px] h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
              onClick={() => router.push(`/admin/hackathons/${params.id}/tasks`)}
            >
              <FileText className="w-6 h-6 text-primary" />
              <span className="font-medium">Задачи хакатона</span>
            </Button>

            <Button
              variant="outline"
              className="flex-1 min-w-[200px] h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
              onClick={() => router.push(`/admin/hackathons/${params.id}/participants`)}
            >
              <Users className="w-6 h-6 text-primary" />
              <span className="font-medium">Участники хакатона</span>
            </Button>

            {!hackathon.isOpen && new Date(hackathon.startDate) > new Date() && (
              <Button
                variant="outline"
                className="flex-1 min-w-[200px] h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
                onClick={() => router.push(`/admin/hackathons/${params.id}/participation-requests`)}
              >
                <UserPlus className="w-6 h-6 text-primary" />
                <span className="font-medium">Заявки на участие</span>
              </Button>
            )}

            {isHackathonEnded && (
              <Button
                variant="outline"
                className="flex-1 min-w-[200px] h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
                onClick={() => router.push(`/admin/hackathons/${params.id}/statistics`)}
              >
                <BarChart2 className="w-6 h-6 text-primary" />
                <span className="font-medium">Статистика</span>
              </Button>
            )}

            {(new Date(hackathon.startDate) <= new Date() || isHackathonEnded) && (
              <Button
                variant="outline"
                className="flex-1 min-w-[200px] h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
                onClick={() => router.push(`/admin/hackathons/${params.id}/rating`)}
              >
                <Trophy className="w-6 h-6 text-primary" />
                <span className="font-medium">Рейтинг</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 