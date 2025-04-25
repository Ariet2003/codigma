"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Trophy, Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type Hackathon = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  tasks: string[];
  createdAt: string;
  updatedAt: string;
  participants: any[];
  applications: any[];
  submissions: any[];
};

type SortField = "title" | "startDate" | "endDate" | "participants" | "createdAt";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "upcoming" | "active" | "completed";
type TypeFilter = "all" | "open" | "closed";

export default function HackathonsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<SortField>("startDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [hackathonToDelete, setHackathonToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHackathons = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/hackathons?page=${currentPage}&limit=10&sortBy=${sortField}&order=${sortOrder}&status=${statusFilter}&type=${typeFilter}&search=${searchQuery}`
      );
      if (!response.ok) throw new Error("Ошибка при загрузке хакатонов");
      const data = await response.json();
      setHackathons(data.hackathons);
      setTotalPages(data.pages);
    } catch (error) {
      console.error("Ошибка при загрузке хакатонов:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить список хакатонов",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [currentPage, sortField, sortOrder, statusFilter, typeFilter, searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/hackathons/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Ошибка при удалении хакатона");

      toast({
        title: "Успешно",
        description: "Хакатон и все связанные данные удалены",
      });

      fetchHackathons();
    } catch (error) {
      console.error("Ошибка при удалении хакатона:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить хакатон",
      });
    } finally {
      setHackathonToDelete(null);
    }
  };

  const getStatusBadge = (hackathon: Hackathon) => {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    const endDate = new Date(hackathon.endDate);

    if (now < startDate) {
      return <Badge className="bg-yellow-500">Предстоит</Badge>;
    } else if (now >= startDate && now <= endDate) {
      return <Badge className="bg-green-500">Активный</Badge>;
    } else {
      return <Badge className="bg-gray-500">Завершен</Badge>;
    }
  };

  const isHackathonStarted = (hackathon: Hackathon) => {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    return now >= startDate;
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="animate-pulse-slow bg-[#4E7AFF]/10 p-2 rounded-lg">
            <Trophy className="w-6 h-6 text-[#4E7AFF]" />
          </div>
          <h1 className="text-2xl font-bold text-[#4E7AFF]">Хакатоны</h1>
        </div>
        <Button
          onClick={() => router.push("/admin/hackathons/create")}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Создать хакатон
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Поиск хакатонов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="upcoming">Предстоящие</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="completed">Завершенные</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(value: TypeFilter) => setTypeFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value="open">Открытые</SelectItem>
              <SelectItem value="closed">Закрытые</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">По названию</SelectItem>
              <SelectItem value="startDate">По дате начала</SelectItem>
              <SelectItem value="endDate">По дате окончания</SelectItem>
              <SelectItem value="participants">По количеству участников</SelectItem>
              <SelectItem value="createdAt">По дате создания</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "По возрастанию" : "По убыванию"}
          </Button>
        </div>
      </div>

      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Дата начала</TableHead>
              <TableHead>Дата окончания</TableHead>
              <TableHead>Участники</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Загрузка...
                  </div>
                </TableCell>
              </TableRow>
            ) : hackathons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Хакатоны не найдены
                </TableCell>
              </TableRow>
            ) : (
              hackathons.map((hackathon) => (
                <TableRow 
                  key={hackathon.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/admin/hackathons/${hackathon.id}`)}
                >
                  <TableCell className="font-medium">{hackathon.title}</TableCell>
                  <TableCell>{getStatusBadge(hackathon)}</TableCell>
                  <TableCell>
                    <Badge variant={hackathon.isOpen ? "default" : "secondary"}>
                      {hackathon.isOpen ? "Открытый" : "Закрытый"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(hackathon.startDate), "dd MMM yyyy HH:mm", { locale: ru })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(hackathon.endDate), "dd MMM yyyy HH:mm", { locale: ru })}
                  </TableCell>
                  <TableCell>{hackathon.participants?.length || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/hackathons/edit/${hackathon.id}`);
                        }}
                        disabled={isHackathonStarted(hackathon)}
                        title={isHackathonStarted(hackathon) ? "Нельзя редактировать начавшийся хакатон" : "Редактировать"}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setHackathonToDelete(hackathon.id);
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удаление хакатона</AlertDialogTitle>
                            <AlertDialogDescription>
                              Вы уверены, что хотите удалить этот хакатон? Это действие приведет к удалению всех связанных данных:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Список участников</li>
                                <li>Заявки на участие</li>
                                <li>Все отправленные решения</li>
                              </ul>
                              Это действие необратимо.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.stopPropagation();
                                if (hackathonToDelete) handleDelete(hackathonToDelete);
                              }}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Всего страниц: {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            Страница {currentPage} из {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 