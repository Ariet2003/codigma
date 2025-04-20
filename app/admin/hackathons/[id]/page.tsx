"use client";

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown';
import { Calendar, Users, Trophy, Clock, Info, List, ChevronRight, CalendarCheck, CalendarCheck2Icon, CalendarHeart, CalendarRange, CalendarX, CalendarDaysIcon, FileText, BarChart, Copy, Check } from 'lucide-react';
import HackathonTimer from '@/components/ui/hackathon-timer';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

async function getHackathon(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/hackathons/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch hackathon');
  }

  return response.json();
}

async function getHackathonParticipants(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/hackathons/${id}/participants`,
    {
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch participants');
  }

  return response.json();
}

export default function HackathonDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [hackathon, setHackathon] = useState<any>(null);
  const [participants, setParticipants] = useState<any>({ participants: [] });
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const hackathonData = await getHackathon(params.id);
      if (!hackathonData) {
        notFound();
      }
      const participantsData = await getHackathonParticipants(params.id);
      
      setHackathon(hackathonData);
      setParticipants(participantsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  // Обработчик для обновления данных при возврате через стрелки браузера
  useEffect(() => {
    const handleRouteChange = () => {
      fetchData();
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  if (loading || !hackathon) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isUpcoming = new Date(hackathon.startDate) > new Date();
  const isActive = new Date(hackathon.startDate) <= new Date() && new Date(hackathon.endDate) >= new Date();
  const isCompleted = new Date(hackathon.endDate) < new Date();

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
            {!hackathon.isOpen && isUpcoming && (
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">PIN хакатона</p>
                    <p className="font-mono text-lg">{params.id}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-auto shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(params.id);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                      toast.success("PIN хакатона скопирован в буфер обмена");
                    }}
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Кнопки навигации */}
      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href={`/admin/hackathons/${params.id}/tasks`} className="block">
              <Button
                variant="outline"
                className="w-full h-24 text-lg justify-between group hover:border-[#4E7AFF] hover:text-[#4E7AFF]"
              >
                <div className="flex items-center gap-3">
                  <List className="w-6 h-6" />
                  <span>Задачи хакатона</span>
                </div>
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href={`/admin/hackathons/${params.id}/participants`} className="block">
              <Button
                variant="outline"
                className="w-full h-24 text-lg justify-between group hover:border-[#4E7AFF] hover:text-[#4E7AFF]"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  <span>Участники хакатона</span>
                </div>
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            {/* Кнопка "Заявки на участие" только для закрытого и предстоящего хакатона */}
            {!hackathon.isOpen && isUpcoming && (
              <Link href={`/admin/hackathons/${params.id}/participation-requests`} className="block">
                <Button
                  variant="outline"
                  className="w-full h-24 text-lg justify-between group hover:border-[#4E7AFF] hover:text-[#4E7AFF]"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6" />
                    <span>Заявки на участие</span>
                  </div>
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            )}

            {/* Кнопка "Рейтинг" только для активного или завершенного хакатона */}
            {(isActive || isCompleted) && (
              <Link href={`/admin/hackathons/${params.id}/rating`} className="block">
                <Button
                  variant="outline"
                  className="w-full h-24 text-lg justify-between group hover:border-[#4E7AFF] hover:text-[#4E7AFF]"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6" />
                    <span>Рейтинг</span>
                  </div>
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            )}

            {/* Кнопка "Статистика" только для завершенного хакатона */}
            {isCompleted && (
              <Link href={`/admin/hackathons/${params.id}/statistics`} className="block">
                <Button
                  variant="outline"
                  className="w-full h-24 text-lg justify-between group hover:border-[#4E7AFF] hover:text-[#4E7AFF]"
                >
                  <div className="flex items-center gap-3">
                    <BarChart className="w-6 h-6" />
                    <span>Статистика</span>
                  </div>
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 