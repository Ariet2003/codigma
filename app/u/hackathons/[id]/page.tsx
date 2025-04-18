"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Trophy,
  Calendar,
  Users,
  ArrowLeft,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

type Hackathon = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  isParticipating: boolean;
  participantsCount: number;
};

function CountdownTimer({ targetDate, className }: { targetDate: string, className?: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Clock className="w-5 h-5 text-primary" />
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="flex flex-col">
          <span className="text-2xl font-bold tabular-nums">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">дней</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold tabular-nums">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">часов</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold tabular-nums">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">минут</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold tabular-nums">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">секунд</span>
        </div>
      </div>
    </div>
  );
}

export default function HackathonPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState(false);

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const response = await fetch(`/api/hackathons/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch hackathon');
        const data = await response.json();
        setHackathon(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error("Не удалось загрузить информацию о хакатоне");
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();
  }, [params.id]);

  const handleParticipate = async () => {
    if (!hackathon) return;
    
    try {
      setParticipating(true);
      const response = await fetch(`/api/hackathons/${hackathon.id}/participate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      // Обновляем данные хакатона после успешного участия
      const updatedHackathon = {
        ...hackathon,
        isParticipating: true,
        participantsCount: hackathon.participantsCount + 1
      };
      setHackathon(updatedHackathon);

      // Показываем уведомление об успешной регистрации
      toast.success("Вы успешно зарегистрировались на хакатон");

      // Перенаправляем на список хакатонов
      setTimeout(() => {
        router.push("/u/hackathons");
      }, 1500);

    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Не удалось зарегистрироваться на хакатон");
    } finally {
      setParticipating(false);
    }
  };

  const isHackathonActive = (hackathon: Hackathon) => {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    const endDate = new Date(hackathon.endDate);
    return now >= startDate && now <= endDate;
  };

  const isHackathonUpcoming = (hackathon: Hackathon) => {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    return now < startDate;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Хакатон не найден</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container py-8 space-y-8">
        {/* Верхняя панель с кнопкой назад */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="group flex items-center gap-2 rounded-lg border bg-gradient-to-r from-background to-background/80 px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:border-primary/20 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:text-primary hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Назад к списку
          </Button>
        </div>

        {/* Основной контент */}
        <div className="space-y-8">
          {/* Информация о хакатоне */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-muted/50 via-background to-background/80 p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:bg-gradient-to-b hover:from-muted/80 hover:via-background hover:to-background/80">
            <div className="absolute right-0 top-0 opacity-[0.15] transform translate-x-1/4 -translate-y-1/4">
              <Trophy className="w-72 h-72 text-primary rotate-12" />
            </div>
            <div className="relative space-y-6">
              <div className="flex items-start justify-between gap-8">
                <div className="space-y-4 flex-1">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground/90">
                    {hackathon.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>
                        {format(new Date(hackathon.startDate), "dd MMM yyyy HH:mm", { locale: ru })}
                        {" - "}
                        {format(new Date(hackathon.endDate), "dd MMM yyyy HH:mm", { locale: ru })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{hackathon.participantsCount} участников</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={hackathon.isOpen ? "default" : "secondary"} className="px-3 py-1">
                        {hackathon.isOpen ? "Открытый" : "Закрытый"}
                      </Badge>
                      {isHackathonUpcoming(hackathon) ? (
                        <Badge className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          Предстоит
                        </Badge>
                      ) : isHackathonActive(hackathon) ? (
                        <Badge className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20">
                          Активный
                        </Badge>
                      ) : (
                        <Badge className="px-3 py-1 bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                          Завершен
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {isHackathonUpcoming(hackathon) && !hackathon.isParticipating && hackathon.isOpen && (
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
                    onClick={handleParticipate}
                    disabled={participating}
                  >
                    {participating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Регистрация...
                      </div>
                    ) : (
                      <>
                        <Trophy className="w-5 h-5" />
                        Участвовать
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Таймер */}
              {(isHackathonUpcoming(hackathon) || isHackathonActive(hackathon)) && (
                <div className="flex items-center justify-between rounded-xl border bg-card/50 backdrop-blur-sm p-6">
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-medium">
                      {isHackathonUpcoming(hackathon) ? "До начала хакатона" : "До завершения хакатона"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isHackathonUpcoming(hackathon) 
                        ? "Успейте зарегистрироваться!" 
                        : "Торопитесь завершить задания"}
                    </p>
                  </div>
                  <CountdownTimer 
                    targetDate={isHackathonUpcoming(hackathon) 
                      ? hackathon.startDate 
                      : hackathon.endDate
                    }
                    className="bg-background/40 backdrop-blur-sm rounded-lg px-6 py-3" 
                  />
                </div>
              )}

              {/* Описание */}
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <Markdown>{hackathon.description}</Markdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 