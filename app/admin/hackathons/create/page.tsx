"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format, setHours, setMinutes } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, Trophy, X, Clock, Sparkles, ChevronLeft, ChevronRight, Eye, Edit, Wand2, Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';

type Task = {
  id: string;
  title: string;
  difficulty: string;
  description: string;
};

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

interface CreateHackathonProps {
  isEditing?: boolean;
  hackathonData?: any;
}

export default function CreateHackathon({ isEditing = false, hackathonData }: CreateHackathonProps) {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [isOpen, setIsOpen] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdHackathonId, setCreatedHackathonId] = useState<string>("");
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeString = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

  // Устанавливаем флаг клиентского рендеринга
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Загрузка сохраненных данных из localStorage при монтировании компонента
  useEffect(() => {
    if (!isClient || isEditing) return;

    try {
      const savedTitle = localStorage.getItem("hackathon_title");
      const savedDescription = localStorage.getItem("hackathon_description");
      const savedStartDate = localStorage.getItem("hackathon_startDate");
      const savedEndDate = localStorage.getItem("hackathon_endDate");
      const savedStartTime = localStorage.getItem("hackathon_startTime");
      const savedEndTime = localStorage.getItem("hackathon_endTime");
      const savedIsOpen = localStorage.getItem("hackathon_isOpen");
      const savedSelectedTasks = localStorage.getItem("hackathon_selectedTasks");

      if (savedTitle) setTitle(savedTitle);
      if (savedDescription) setDescription(savedDescription);
      if (savedStartTime) setStartTime(savedStartTime);
      if (savedEndTime) setEndTime(savedEndTime);
      if (savedIsOpen !== null) setIsOpen(savedIsOpen === "true");

      if (savedStartDate) {
        const parsedStartDate = new Date(savedStartDate);
        if (!isNaN(parsedStartDate.getTime())) {
          setStartDate(parsedStartDate);
        }
      }

      if (savedEndDate) {
        const parsedEndDate = new Date(savedEndDate);
        if (!isNaN(parsedEndDate.getTime())) {
          setEndDate(parsedEndDate);
        }
      }

      if (savedSelectedTasks) {
        const parsedTasks = JSON.parse(savedSelectedTasks);
        if (Array.isArray(parsedTasks)) {
          setSelectedTasks(parsedTasks);
        }
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных из localStorage:", error);
    }
  }, [isClient, isEditing]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/tasks?page=${currentPage}&limit=10`);
        if (!response.ok) throw new Error("Ошибка при загрузке задач");
        const data = await response.json();
        setAvailableTasks(Array.isArray(data.tasks) ? data.tasks : []);
        setTotalPages(data.pages || 1);
      } catch (error) {
        console.error("Ошибка при загрузке задач:", error);
        setAvailableTasks([]);
      }
    };

    fetchTasks();
  }, [currentPage]);

  const filteredTasks = availableTasks
    .filter(task => !selectedTasks.some(selectedTask => selectedTask.id === task.id))
    .filter(task => 
      selectedDifficulty === "all" ? true : task.difficulty === selectedDifficulty
    )
    .filter(task => {
      const searchLower = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(searchLower) ||
             task.description.toLowerCase().includes(searchLower);
    });

  // Сохранение в localStorage при изменении значений
  useEffect(() => {
    if (!isClient || isEditing) return;

    try {
      if (title) localStorage.setItem("hackathon_title", title);
      if (description) localStorage.setItem("hackathon_description", description);
      if (startDate) localStorage.setItem("hackathon_startDate", startDate.toISOString());
      if (endDate) localStorage.setItem("hackathon_endDate", endDate.toISOString());
      if (startTime) localStorage.setItem("hackathon_startTime", startTime);
      if (endTime) localStorage.setItem("hackathon_endTime", endTime);
      localStorage.setItem("hackathon_isOpen", String(isOpen));
      if (selectedTasks.length > 0) localStorage.setItem("hackathon_selectedTasks", JSON.stringify(selectedTasks));
    } catch (error) {
      console.error("Ошибка при сохранении данных в localStorage:", error);
    }
  }, [isClient, isEditing, title, description, startDate, endDate, startTime, endTime, isOpen, selectedTasks]);

  // Очистка localStorage после успешного создания хакатона
  const clearLocalStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hackathon_title");
      localStorage.removeItem("hackathon_description");
      localStorage.removeItem("hackathon_startDate");
      localStorage.removeItem("hackathon_endDate");
      localStorage.removeItem("hackathon_startTime");
      localStorage.removeItem("hackathon_endTime");
      localStorage.removeItem("hackathon_isOpen");
      localStorage.removeItem("hackathon_selectedTasks");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime("00:00");
    setEndTime("23:59");
    setIsOpen(true);
    setSelectedTasks([]);
    setIsPreviewMode(false);
    clearLocalStorage();
  };

  const handleCreateHackathon = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не выбраны даты проведения хакатона",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите название хакатона",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите описание хакатона",
      });
      return;
    }

    if (selectedTasks.length === 0) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Выберите хотя бы одну задачу",
      });
      return;
    }

    try {
      // Создаем копии дат для изменения времени
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      const startDateTime = new Date(startDate);
      startDateTime.setUTCHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(endDate);
      endDateTime.setUTCHours(endHours, endMinutes, 0, 0);

      const taskIds = selectedTasks.map(task => task.id);

      const response = await fetch("/api/hackathons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          isOpen,
          tasks: taskIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка при создании хакатона");
      }

      const hackathon = await response.json();
      setCreatedHackathonId(hackathon.id);
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Ошибка при создании хакатона:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Произошла ошибка при создании хакатона",
      });
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false);
    resetForm();
    router.push("/admin/hackathons/create");
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/hackathons/${createdHackathonId}`;
    try {
      await navigator.clipboard.writeText(link);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    } catch (err) {
      console.error("Ошибка при копировании ссылки:", err);
    }
  };

  const isFormValid = title && description && startDate && endDate && selectedTasks.length > 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // Обработчик изменения даты начала
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    // Если дата окончания раньше новой даты начала, сбрасываем её
    if (date && endDate && endDate < date) {
      setEndDate(undefined);
    }
  };

  // Обработчик изменения времени начала
  const handleStartTimeChange = (time: string) => {
    // Проверяем, если выбранная дата сегодня и время меньше текущего
    if (startDate && startDate.getTime() === today.getTime()) {
      const [hours, minutes] = time.split(":").map(Number);
      const [currentHours, currentMinutes] = currentTimeString.split(":").map(Number);
      
      if (hours < currentHours || (hours === currentHours && minutes < currentMinutes)) {
        return;
      }
    }
    
    setStartTime(time);
    
    // Если даты совпадают и время окончания раньше нового времени начала
    if (startDate && endDate && startDate.getTime() === endDate.getTime()) {
      const [newStartHours, newStartMinutes] = time.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);
      
      const startTotalMinutes = newStartHours * 60 + newStartMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      
      if (endTotalMinutes <= startTotalMinutes) {
        setEndTime(time);
      }
    }
  };

  // Обработчик изменения времени окончания
  const handleEndTimeChange = (time: string) => {
    const [newEndHours, newEndMinutes] = time.split(":").map(Number);
    
    if (startDate && endDate && startDate.getTime() === endDate.getTime()) {
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = newEndHours * 60 + newEndMinutes;
      
      if (endTotalMinutes <= startTotalMinutes) {
        return;
      }
    }
    
    setEndTime(time);
  };

  const handleConfirmCreate = () => {
    setShowConfirmDialog(false);
    handleCreateHackathon();
  };

  // Обработчик перетаскивания задач
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(selectedTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedTasks(items);
  };

  // Заполняем форму данными при редактировании
  useEffect(() => {
    if (isEditing && hackathonData) {
      setTitle(hackathonData.title);
      setDescription(hackathonData.description);
      setStartDate(new Date(hackathonData.startDate));
      setEndDate(new Date(hackathonData.endDate));
      setStartTime(format(new Date(hackathonData.startDate), "HH:mm"));
      setEndTime(format(new Date(hackathonData.endDate), "HH:mm"));
      setIsOpen(hackathonData.isOpen);
      setSelectedTasks(hackathonData.tasks);
    }
  }, [isEditing, hackathonData]);

  const handleUpdateHackathon = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не выбраны даты проведения хакатона",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите название хакатона",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите описание хакатона",
      });
      return;
    }

    if (selectedTasks.length === 0) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Выберите хотя бы одну задачу",
      });
      return;
    }

    try {
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      const startDateTime = new Date(startDate);
      startDateTime.setUTCHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(endDate);
      endDateTime.setUTCHours(endHours, endMinutes, 0, 0);

      const taskIds = selectedTasks.map(task => task.id);

      const response = await fetch(`/api/hackathons/${hackathonData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          isOpen,
          tasks: taskIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка при обновлении хакатона");
      }

      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Ошибка при обновлении хакатона:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Произошла ошибка при обновлении хакатона",
      });
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6 max-w-screen-2xl mx-auto">
      {isClient && (
        <>
          <Toaster />
          <div className="flex items-center gap-2">
            <div className="animate-pulse-slow bg-[#4E7AFF]/10 p-2 rounded-lg">
              <Trophy className="w-6 h-6 text-[#4E7AFF]" />
            </div>
            <h1 className="text-2xl font-bold text-[#4E7AFF]">
              {isEditing ? "Редактировать хакатон" : "Создать хакатон"}
            </h1>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-medium">
                Название хакатона
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название хакатона"
                className="border border-color-[hsl(var(--border))] bg-transparent text-foreground focus:ring-2 focus:ring-[#4E7AFF]/30"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="text-lg font-medium">
                  Описание хакатона
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="gap-2"
                  >
                    {isPreviewMode ? (
                      <>
                        <Edit className="w-4 h-4" />
                        Редактировать
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Просмотр
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setIsGeneratingDescription(true);
                      try {
                        const response = await fetch("/api/generate-description", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            content: description,
                            prompt: "Улучши это описание хакатона, сделав его более профессиональным и информативным. Используй Markdown для форматирования. Добавь заголовки, списки и другие элементы форматирования для лучшей читаемости. Сохрани всю важную информацию из оригинального текста."
                          }),
                        });
                        
                        if (!response.ok) throw new Error("Ошибка при генерации описания");
                        
                        const data = await response.json();
                        if (data.content) {
                          setDescription(data.content);
                          setIsPreviewMode(true);
                        } else {
                          throw new Error("Некорректный ответ от API");
                        }
                      } catch (error) {
                        console.error("Ошибка при генерации описания:", error);
                      } finally {
                        setIsGeneratingDescription(false);
                      }
                    }}
                    disabled={!description || isGeneratingDescription}
                    className="gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    {isGeneratingDescription ? "Улучшаем..." : "Улучшить описание"}
                  </Button>
                </div>
              </div>
              {isPreviewMode ? (
                <div className="min-h-[150px] rounded-md border p-4" data-color-mode={theme === "dark" ? "dark" : "light"}>
                  <MDEditor.Markdown source={description} className="!bg-transparent" />
                </div>
              ) : (
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Введите описание хакатона"
                  className="min-h-[150px] font-mono"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-lg font-medium flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#4E7AFF]" />
                  Дата и время начала
                </Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        {startDate ? (
                          format(startDate, "PPP", { locale: ru })
                        ) : (
                          <span>Выберите дату начала</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateChange}
                        disabled={(date) => date < today}
                        initialFocus
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-32"
                    min={startDate?.getTime() === today.getTime() ? currentTimeString : undefined}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-lg font-medium flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#4E7AFF]" />
                  Дата и время окончания
                </Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                        disabled={!startDate}
                      >
                        {endDate ? (
                          format(endDate, "PPP", { locale: ru })
                        ) : (
                          <span>{startDate ? "Выберите дату окончания" : "Сначала выберите дату начала"}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => 
                          startDate ? date < startDate : false
                        }
                        initialFocus
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    className="w-32"
                    disabled={!startDate}
                    min={startDate && endDate?.getTime() === startDate.getTime() ? startTime : undefined}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isOpen"
                checked={isOpen}
                onCheckedChange={setIsOpen}
              />
              <Label htmlFor="isOpen" className="text-lg font-medium">
                Открытый хакатон
              </Label>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-medium">Задачи хакатона</Label>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <Label>Выбранные задачи</Label>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="selected-tasks">
                      {(provided: DroppableProvided) => (
                        <ScrollArea 
                          className="h-[200px] rounded-md border p-4 mt-2"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {selectedTasks.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                              Нет выбранных задач
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {selectedTasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided: DraggableProvided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="flex items-center gap-2 p-2 rounded-lg border bg-card"
                                    >
                                      <Badge className={getDifficultyColor(task.difficulty)}>
                                        {task.difficulty}
                                      </Badge>
                                      <span className="font-medium">{task.title}</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedTasks(selectedTasks.filter(t => t.id !== task.id))}
                                        className="text-red-500 hover:text-red-600 ml-auto h-6 w-6"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </ScrollArea>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>

                <div className="md:w-1/2 space-y-2">
                  <Label>Доступные задачи</Label>
                  <Select
                    onValueChange={(value) => {
                      const task = availableTasks.find(t => t.id === value);
                      if (task && !selectedTasks.some(t => t.id === task.id)) {
                        setSelectedTasks([...selectedTasks, task]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите задачу" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 space-y-2">
                        <Input
                          placeholder="Поиск задач..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="mb-2"
                        />
                        <div className="flex gap-1 mb-2">
                          <Button
                            size="sm"
                            variant={selectedDifficulty === "all" ? "default" : "outline"}
                            onClick={() => setSelectedDifficulty("all")}
                            className="flex-1"
                          >
                            Все
                          </Button>
                          <Button
                            size="sm"
                            variant={selectedDifficulty === "easy" ? "default" : "outline"}
                            onClick={() => setSelectedDifficulty("easy")}
                            className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20"
                          >
                            Easy
                          </Button>
                          <Button
                            size="sm"
                            variant={selectedDifficulty === "medium" ? "default" : "outline"}
                            onClick={() => setSelectedDifficulty("medium")}
                            className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/20"
                          >
                            Medium
                          </Button>
                          <Button
                            size="sm"
                            variant={selectedDifficulty === "hard" ? "default" : "outline"}
                            onClick={() => setSelectedDifficulty("hard")}
                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20"
                          >
                            Hard
                          </Button>
                        </div>
                        <div className="border-t pt-2">
                          {filteredTasks.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                              Задачи не найдены
                            </div>
                          ) : (
                            filteredTasks.map((task) => (
                              <SelectItem key={task.id} value={task.id}>
                                <div className="flex items-center gap-2">
                                  <Badge className={getDifficultyColor(task.difficulty)}>
                                    {task.difficulty}
                                  </Badge>
                                  {task.title}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-sm">
                            Страница {currentPage} из {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => isEditing ? setShowConfirmDialog(true) : handleCreateHackathon()}
                disabled={!isFormValid || isLoading}
                className="px-6 py-6 rounded-lg bg-[#4E7AFF] text-white font-medium transition-all hover:bg-[#4E7AFF]/90 hover:scale-105 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {isEditing ? "Сохранить изменения" : "Создать хакатон"}
              </Button>
            </div>
          </div>

          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Подтверждение изменений" : "Подтверждение создания хакатона"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 overflow-y-auto pr-6 -mr-6">
                <div>
                  <Label className="font-medium">Название</Label>
                  <p>{title}</p>
                </div>
                <div>
                  <Label className="font-medium">Описание</Label>
                  <div className="rounded-md border p-4 mt-1" data-color-mode={theme === "dark" ? "dark" : "light"}>
                    <MDEditor.Markdown source={description} className="!bg-transparent" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Дата и время начала</Label>
                    <p>{startDate ? `${format(startDate, "PPP", { locale: ru })} ${startTime}` : "-"}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Дата и время окончания</Label>
                    <p>{endDate ? `${format(endDate, "PPP", { locale: ru })} ${endTime}` : "-"}</p>
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Тип хакатона</Label>
                  <p>{isOpen ? "Открытый" : "Закрытый"}</p>
                </div>
                <div>
                  <Label className="font-medium">Выбранные задачи ({selectedTasks.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedTasks.map((task) => (
                      <Badge key={task.id} className={getDifficultyColor(task.difficulty)}>
                        {task.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Вернуться к редактированию
                </Button>
                <Button
                  onClick={isEditing ? handleUpdateHackathon : handleConfirmCreate}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {isEditing ? "Сохранение..." : "Создание..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {isEditing ? "Сохранить изменения" : "Создать хакатон"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Хакатон успешно обновлен" : "Хакатон успешно создан"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {isEditing ? (
                  <p>Изменения успешно сохранены.</p>
                ) : (
                  !isOpen ? (
                    <>
                      <p>
                        Закрытый хакатон создан и готов принимать заявки на участие. 
                        Вы можете управлять заявками в разделе "Хакатоны". Поделитесь этим PIN-кодом с участниками:
                      </p>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <Input 
                          readOnly 
                          value={createdHackathonId}
                          className="bg-transparent text-center font-mono text-lg"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(createdHackathonId);
                            setIsLinkCopied(true);
                            setTimeout(() => setIsLinkCopied(false), 2000);
                          }}
                          className="shrink-0"
                        >
                          {isLinkCopied ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p>
                      Открытый хакатон успешно создан и опубликован. 
                      Участники могут присоединиться к нему.
                    </p>
                  )
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => {
                  setShowSuccessDialog(false);
                  if (isEditing) {
                    router.push("/admin/hackathons");
                  } else {
                    handleCloseSuccess();
                  }
                }}>
                  {isEditing ? "Вернуться к списку" : "Закрыть"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
} 