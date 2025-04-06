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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Search, 
  SlidersHorizontal,
  ArrowUpDown,
  Pencil,
  Trash2,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type Task = {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  test_count: number;
  created_at: string;
  updated_at: string;
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(\`/api/tasks?page=\${currentPage}&limit=10&search=\${searchQuery}&difficulty=\${difficulty}&sortBy=\${sortBy}&sortOrder=\${sortOrder}\`);
      const data = await response.json();
      setTasks(data.tasks);
      setTotalPages(Math.ceil(data.total / 10));
    } catch (error) {
      console.error("Ошибка при загрузке задач:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentPage, searchQuery, difficulty, sortBy, sortOrder]);

  const handleDelete = async () => {
    if (!taskToDelete) return;

    try {
      const response = await fetch(\`/api/tasks/\${taskToDelete.id}\`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTasks();
        setShowDeleteDialog(false);
        setTaskToDelete(null);
      } else {
        throw new Error("Ошибка при удалении задачи");
      }
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "hard": return "text-red-500";
      default: return "text-foreground";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "Легкий";
      case "medium": return "Средний";
      case "hard": return "Сложный";
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="animate-pulse-slow bg-[#4E7AFF]/10 p-2 rounded-lg">
            <BookOpen className="w-6 h-6 text-[#4E7AFF]" />
          </div>
          <h1 className="text-2xl font-bold text-[#4E7AFF]">
            Задачи
          </h1>
        </div>
        <Button
          onClick={() => router.push("/admin/tasks/create")}
          className="px-6 py-3 rounded-lg bg-[#4E7AFF] text-white font-medium transition-all hover:bg-[#4E7AFF]/90 hover:scale-105 text-center flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
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
              <SelectItem value="">Все</SelectItem>
              <SelectItem value="easy" className="text-green-500">Легкий</SelectItem>
              <SelectItem value="medium" className="text-yellow-500">Средний</SelectItem>
              <SelectItem value="hard" className="text-red-500">Сложный</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-color-[hsl(var(--border))] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">Название</TableHead>
              <TableHead className="font-medium">Сложность</TableHead>
              <TableHead className="font-medium">
                <button
                  onClick={() => handleSort("test_count")}
                  className="flex items-center gap-1 hover:text-[#4E7AFF]"
                >
                  Тесты
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </TableHead>
              <TableHead className="font-medium">
                <button
                  onClick={() => handleSort("created_at")}
                  className="flex items-center gap-1 hover:text-[#4E7AFF]"
                >
                  Создано
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </TableHead>
              <TableHead className="font-medium">
                <button
                  onClick={() => handleSort("updated_at")}
                  className="flex items-center gap-1 hover:text-[#4E7AFF]"
                >
                  Обновлено
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
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
                  <TableCell>{task.test_count}</TableCell>
                  <TableCell>
                    {format(new Date(task.created_at), "d MMMM yyyy", { locale: ru })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(task.updated_at), "d MMMM yyyy", { locale: ru })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(\`/tasks/\${task.id}/edit\`)}
                        className="text-[#4E7AFF] hover:text-[#4E7AFF]/80"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setTaskToDelete(task);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
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
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "bg-[#4E7AFF]" : ""}
            >
              {page}
            </Button>
          ))}
        </div>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удаление задачи</DialogTitle>
            <DialogDescription>
              Вы действительно хотите удалить задачу "{taskToDelete?.title}"?
              Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}