import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown';
import { Calendar, Users, Trophy, Clock, Info, List, ChevronRight, CalendarCheck, CalendarCheck2Icon, CalendarHeart, CalendarRange, CalendarX, CalendarDaysIcon } from 'lucide-react';

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

export default async function HackathonDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const hackathon = await getHackathon(params.id);
  if (!hackathon) {
    notFound();
  }

  const participants = await getHackathonParticipants(params.id);

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
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 