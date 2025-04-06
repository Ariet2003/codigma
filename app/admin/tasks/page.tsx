"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pencil,
  Trash2,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { BookOpen } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  functionName: string;
  inputParams: any;
  outputParams: any;
  test_count: number;
  created_at: string;
  updated_at: string;
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchQuery && { search: searchQuery }),
        ...(difficulty && difficulty !== "all" && { difficulty }),
        sortBy,
        sortOrder,
      });

      const response = await fetch("/api/tasks?" + params);
      const data = await response.json();

      if (response.ok) {
        setTasks(data.tasks);
        setTotalPages(Math.ceil(data.total / 10));
      } else {
        console.error("Ошибка при загрузке задач:", data.error);
      }
    } catch (error) {
      console.error("Ошибка при загрузке задач:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentPage, searchQuery, difficulty, sortBy, sortOrder]);

  const handleDelete = async () => {
    if (!taskToDelete) return;

    try {
      const response = await fetch("/api/tasks/" + taskToDelete, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        setTaskToDelete(null);
        fetchTasks();
      } else {
        const data = await response.json();
        console.error("Ошибка при удалении задачи:", data.error);
      }
    } catch (error) {
      console.error("Ошибка при удалении задачи:", error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "hard":
        return "text-red-500";
      default:
        return "";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Легкий";
      case "medium":
        return "Средний";
      case "hard":
        return "Сложный";
      default:
        return difficulty;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="animate-pulse-slow bg-[#4E7AFF]/10 p-2 rounded-lg">
          <BookOpen className="w-6 h-6 text-[#4E7AFF]" />
        </div>
        <h1 className="text-2xl font-bold text-[#4E7AFF]">
          Задачи
        </h1>
      </div>

        <Button onClick={() => router.push("/admin/tasks/create")}>
          Создать задачу
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border border-color-[hsl(var(--border))] bg-transparent text-foreground focus:ring-2 focus:ring-[#4E7AFF]/30"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SlidersHorizontal className="w-4 h-4 text-[#4E7AFF]" />
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-[180px] border border-color-[hsl(var(--border))] bg-transparent text-foreground focus:ring-2 focus:ring-[#4E7AFF]/30">
              <SelectValue placeholder="Сложность" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="easy" className="text-green-500">Легкий</SelectItem>
              <SelectItem value="medium" className="text-yellow-500">Средний</SelectItem>
              <SelectItem value="hard" className="text-red-500">Сложный</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[210px] border border-color-[hsl(var(--border))] bg-transparent text-foreground focus:ring-2 focus:ring-[#4E7AFF]/30">
              <SelectValue placeholder="Сортировать по" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_at">По дате обновления</SelectItem>
              <SelectItem value="created_at">По дате создания</SelectItem>
              <SelectItem value="test_count">По количеству тестов</SelectItem>
              <SelectItem value="title">По названию</SelectItem>
              <SelectItem value="difficulty">По сложности</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="w-10 h-10 p-2"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Сложность</TableHead>
              <TableHead className="text-center">Тесты</TableHead>
              <TableHead>Создано</TableHead>
              <TableHead>Обновлено</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Задачи не найдены
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <span className={getDifficultyColor(task.difficulty)}>
                      {getDifficultyLabel(task.difficulty)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{task.test_count}</TableCell>
                  <TableCell>
                    {format(new Date(task.created_at), "dd MMM yyyy", { locale: ru })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(task.updated_at), "dd MMM yyyy", { locale: ru })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/admin/tasks/" + task.id + "/edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setTaskToDelete(task.id);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Назад
          </Button>
          <span className="text-sm text-muted-foreground">
            Страница {currentPage} из {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Вперед
          </Button>
        </div>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удаление задачи</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить эту задачу? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setTaskToDelete(null);
              }}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 