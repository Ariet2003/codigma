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
  CheckCircle2,
  ArrowLeft,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CountdownTimer } from "@/components/CountdownTimer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Hackathon = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  isParticipating: boolean;
  participantsCount: number;
  solvedTasksCount: number;
  totalTasksCount: number;
  totalScore: number;
};

type ParticipationRequest = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  hackathon: {
    title: string;
    startDate: string;
    endDate: string;
  };
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [requests, setRequests] = useState<ParticipationRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

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

  const handleJoinPrivateHackathon = async () => {
    if (!pinCode.trim()) {
      toast.error("Введите PIN-код хакатона");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/hackathons/join-private", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hackathonId: pinCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Произошла ошибка");
      }

      toast.success(data.message);
      setPinCode("");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await fetch('/api/hackathons/requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data.requests);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Не удалось загрузить заявки');
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (showRequests) {
      fetchRequests();
    }
  }, [showRequests]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            На рассмотрении
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Одобрено
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            Отклонено
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="container py-6 space-y-6">
        {!showRequests ? (
          <>
            <div className="relative bg-background/50 backdrop-blur-sm border rounded-xl shadow-md">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" />
              <div className="relative p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <Tabs value={viewMode} onValueChange={(value) => {
                    setViewMode(value as 'all' | 'my');
                    setPage(1);
                  }} className="w-full max-w-md">
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
                  <Button
                    variant="outline"
                    onClick={() => setShowRequests(true)}
                    className="gap-2"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Мои заявки
                  </Button>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/80 w-5 h-5 transition-colors group-hover:text-primary" />
                      <Input
                        placeholder="Поиск хакатонов..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 bg-background/80 border-muted/50 transition-all duration-300 hover:border-primary/50 focus:border-primary focus:bg-background w-full"
                      />
                    </div>
                  </div>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full md:w-auto gap-2 h-11">
                        <Trophy className="w-4 h-4" />
                        Закрытый хакатон
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Присоединиться к закрытому хакатону</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>PIN-код хакатона</Label>
                          <Input
                            placeholder="Введите PIN-код"
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value)}
                          />
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={handleJoinPrivateHackathon}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              Отправка...
                            </>
                          ) : (
                            "Отправить заявку"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

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
                          {!hackathon.isOpen && (
                            <Badge variant="outline" className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 font-medium">
                              <Lock className="w-3 h-3 mr-1" />
                              Закрытый
                            </Badge>
                          )}
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

                      {hackathon.isParticipating && (
                        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3 w-3 text-primary/70" />
                              Решено задач
                            </div>
                            <div className="font-medium">
                              {hackathon.solvedTasksCount} / {hackathon.totalTasksCount}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Trophy className="h-3 w-3 text-primary/70" />
                              Баллы
                            </div>
                            <div className="font-medium">
                              {hackathon.totalScore}
                            </div>
                  </div>
                </div>
                      )}

                <div className="flex items-center justify-between">
                        {isHackathonUpcoming(hackathon) ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-500/10 text-blue-500 font-medium">
                            <Timer className="w-4 h-4" />
                            <CountdownTimer targetDate={hackathon.startDate} className="text-sm" />
                  </div>
                        ) : isHackathonActive(hackathon) ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/10 text-green-500 font-medium">
                            <Timer className="w-4 h-4" />
                            <CountdownTimer targetDate={hackathon.endDate} className="text-sm" />
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
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Мои заявки на участие</h2>
              <Button
                variant="outline"
                onClick={() => setShowRequests(false)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Вернуться к хакатонам
              </Button>
            </div>
            
            {loadingRequests ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                У вас пока нет заявок на участие в закрытых хакатонах
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Хакатон</TableHead>
                      <TableHead>Дата подачи</TableHead>
                      <TableHead>Начало хакатона</TableHead>
                      <TableHead>Конец хакатона</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.hackathon.title}</TableCell>
                        <TableCell>{formatDate(request.createdAt)}</TableCell>
                        <TableCell>{formatDate(request.hackathon.startDate)}</TableCell>
                        <TableCell>{formatDate(request.hackathon.endDate)}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
    </div>
    </TooltipProvider>
  );
} 