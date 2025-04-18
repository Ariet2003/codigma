"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy,
  Calendar,
  Users,
  Clock,
  Search,
  Filter,
  SortAsc,
  ChevronLeft,
  ChevronRight,
  Timer,
  ArrowRight,
  ArrowDownAZ,
  ArrowUpAZ,
  SlidersHorizontal,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

function CountdownTimer({ targetDate }: { targetDate: string }) {
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
    <div className="flex items-center gap-1 text-sm">
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && <span>{timeLeft.days}д</span>}
        <span>{String(timeLeft.hours).padStart(2, '0')}:</span>
        <span>{String(timeLeft.minutes).padStart(2, '0')}:</span>
        <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

// Добавим функцию для очистки описания от хэштегов
function cleanDescription(description: string) {
  return description.replace(/#/g, '').trim();
}

export default function HackathonsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'startDate');
  const [order, setOrder] = useState(searchParams.get('order') || 'asc');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'my'>('all');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status !== 'all') params.set('status', status);
    if (sortBy !== 'startDate') params.set('sortBy', sortBy);
    if (order !== 'asc') params.set('order', order);
    if (page > 1) params.set('page', page.toString());
    if (viewMode === 'my') params.set('participating', 'true');

    router.push(`/u/hackathons?${params.toString()}`, { scroll: false });
  }, [search, status, sortBy, order, page, viewMode]);

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
        ...(search && { search }),
        ...(status !== 'all' && { status }),
        sortBy,
        order,
      });

      // Используем разные эндпоинты для всех и моих хакатонов
      const endpoint = viewMode === 'my' ? '/api/hackathons/my' : '/api/hackathons';
      const response = await fetch(`${endpoint}?${params.toString()}`);
      
      if (!response.ok) throw new Error('Failed to fetch hackathons');
      
      const data = await response.json();
      setHackathons(data.hackathons || []);
      setTotalPages(data.pages || 1);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error('Error:', error);
      setHackathons([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [page, search, status, sortBy, order, viewMode]);

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleSort = (value: string) => {
    if (value === sortBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(value);
      setOrder('asc');
    }
    setPage(1);
  };

  const toggleOrder = () => {
    setOrder(order === 'asc' ? 'desc' : 'asc');
    setPage(1);
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

  return (
    <TooltipProvider delayDuration={200}>
      <div className="container py-6 space-y-6">
        <div className="relative bg-background/50 backdrop-blur-sm border rounded-xl shadow-md">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" />
          <div className="relative p-4 space-y-4">
            <Tabs value={viewMode} onValueChange={(value) => {
              setViewMode(value as 'all' | 'my');
              setPage(1);
            }} className="w-full">
              <TabsList className="w-full max-w-md grid grid-cols-2 bg-muted/50 p-1 rounded-lg">
                <TabsTrigger 
                  value="all" 
                  className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Trophy className="w-4 h-4" />
                  Все хакатоны
                </TabsTrigger>
                <TabsTrigger 
                  value="my" 
                  className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Users className="w-4 h-4" />
                  Мои хакатоны
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/80 w-5 h-5 transition-colors group-hover:text-primary" />
                  <Input
                    placeholder="Поиск хакатонов..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11 bg-background/80 border-muted/50 transition-all duration-300 hover:border-primary/50 focus:border-primary focus:bg-background w-full"
                  />
                </div>
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select value={status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px] h-11 bg-background/80 border-muted/50 transition-all duration-300 hover:border-primary/50 hover:bg-background focus:bg-background shadow-sm hover:shadow-md">
                          <div className="flex items-center">
                            <Filter className="w-5 h-5 mr-2.5 text-primary/70 flex-shrink-0" />
                            <SelectValue placeholder="Статус" />
                          </div>
                        </SelectTrigger>
                        <SelectContent align="start" sideOffset={5} className="bg-background/95 border-primary/20 shadow-xl">
                          <SelectItem value="all">Все хакатоны</SelectItem>
                          <SelectItem value="upcoming">Предстоящие</SelectItem>
                          <SelectItem value="ongoing">Текущие</SelectItem>
                          <SelectItem value="completed">Завершенные</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="bg-background/95 border-primary/20 shadow-md">
                    Фильтр по статусу хакатона
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select value={sortBy} onValueChange={handleSort}>
                        <SelectTrigger className="w-[180px] h-11 bg-background/80 border-muted/50 transition-all duration-300 hover:border-primary/50 hover:bg-background focus:bg-background shadow-sm hover:shadow-md">
                          <div className="flex items-center">
                            <SortAsc className="w-5 h-5 mr-2.5 text-primary/70 flex-shrink-0" />
                            <SelectValue placeholder="Сортировка" />
                          </div>
                        </SelectTrigger>
                        <SelectContent align="start" sideOffset={5} className="bg-background/95 border-primary/20 shadow-xl">
                          <SelectItem value="startDate">По дате начала</SelectItem>
                          <SelectItem value="title">По названию</SelectItem>
                          <SelectItem value="participantsCount">По участникам</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="bg-background/95 border-primary/20 shadow-md">
                    Выберите поле для сортировки
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleOrder}
                      className={cn(
                        "h-11 w-11 bg-background/80 border-muted/50 transition-all duration-300",
                        "hover:border-primary/50 hover:bg-background focus:bg-background",
                        "shadow-sm hover:shadow-md"
                      )}
                    >
                      {order === 'asc' ? (
                        <ArrowUpAZ className="h-5 w-5 text-primary/70" />
                      ) : (
                        <ArrowDownAZ className="h-5 w-5 text-primary/70" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="bg-background/95 border-primary/20 shadow-md">
                    {order === 'asc' ? 'По возрастанию' : 'По убыванию'}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
      </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : hackathons.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            {viewMode === 'my' ? 'Вы не участвуете ни в одном хакатоне' : 'Хакатоны не найдены'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hackathons.map((hackathon) => (
              <Card 
                key={hackathon.id} 
                className={cn(
                  "group relative overflow-hidden transition-all duration-300",
                  "hover:shadow-lg hover:-translate-y-1",
                  "bg-background/50 backdrop-blur-sm border",
                  hackathon.isParticipating && "border-primary/20"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl line-clamp-1">{hackathon.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      {hackathon.isParticipating && (
                        <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 font-medium">
                          <Users className="w-3 h-3 mr-1" />
                          Участник
                        </Badge>
                      )}
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {cleanDescription(hackathon.description)}
                  </p>
                </CardHeader>
                <CardContent className="relative space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary/70" />
                      <span>
                        {isHackathonUpcoming(hackathon) 
                          ? `Старт: ${new Date(hackathon.startDate).toLocaleDateString("ru-RU")}`
                          : `Финиш: ${new Date(hackathon.endDate).toLocaleDateString("ru-RU")}`
                        }
                      </span>
                  </div>
                  <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary/70" />
                      <span>{hackathon.participantsCount} участников</span>
                    </div>
                  </div>

                <div className="flex items-center justify-between">
                    {isHackathonUpcoming(hackathon) ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-500/10 text-blue-500 font-medium">
                        <Timer className="w-4 h-4" />
                        <CountdownTimer targetDate={hackathon.startDate} />
                  </div>
                    ) : isHackathonActive(hackathon) ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/10 text-green-500 font-medium">
                        <Timer className="w-4 h-4" />
                        <CountdownTimer targetDate={hackathon.endDate} />
                </div>
                    ) : (
                      <Badge variant="secondary" className="px-3 py-1.5 bg-zinc-500/10 text-zinc-500 font-medium">
                        Завершен
                      </Badge>
                    )}
                    
                    <Button
                      variant={isHackathonUpcoming(hackathon) && !hackathon.isParticipating ? "default" : "outline"}
                      className={cn(
                        "transition-all duration-300 font-medium",
                        isHackathonUpcoming(hackathon) && !hackathon.isParticipating
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "border-primary/20 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary"
                      )}
                      onClick={() => router.push(`/u/hackathons/${hackathon.id}`)}
                    >
                      {isHackathonUpcoming(hackathon) && !hackathon.isParticipating ? (
                        <>
                          Участвовать
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      ) : hackathon.isParticipating ? (
                        <>
                          Открыть
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      ) : (
                        <>
                          Посмотреть
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
              </div>
            </CardContent>
          </Card>
        ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Всего хакатонов: {totalItems}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="shadow-none hover:shadow-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-sm">
              Страница {page} из {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="shadow-none hover:shadow-none"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
      </div>
    </div>
    </TooltipProvider>
  );
} 