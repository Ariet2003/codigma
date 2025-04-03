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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import { 
  FileText, 
  BarChart, 
  PenLine, 
  Eye, 
  Wand2,
  Loader2
} from "lucide-react";

// Ключи для localStorage
const STORAGE_KEYS = {
  title: 'create_task_title',
  difficulty: 'create_task_difficulty',
  description: 'create_task_description',
  showMarkdown: 'create_task_show_markdown'
};

export default function CreateTask() {
  // Инициализируем состояние из localStorage или используем значения по умолчанию
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [description, setDescription] = useState("");
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Загружаем данные из localStorage при первом рендере
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const savedTitle = localStorage.getItem(STORAGE_KEYS.title);
      const savedDifficulty = localStorage.getItem(STORAGE_KEYS.difficulty);
      const savedDescription = localStorage.getItem(STORAGE_KEYS.description);
      const savedShowMarkdown = localStorage.getItem(STORAGE_KEYS.showMarkdown);

      if (savedTitle) setTitle(savedTitle);
      if (savedDifficulty) setDifficulty(savedDifficulty);
      if (savedDescription) setDescription(savedDescription);
      if (savedShowMarkdown) setShowMarkdown(savedShowMarkdown === 'true');
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Сохраняем изменения в localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem(STORAGE_KEYS.title, title);
      localStorage.setItem(STORAGE_KEYS.difficulty, difficulty);
      localStorage.setItem(STORAGE_KEYS.description, description);
      localStorage.setItem(STORAGE_KEYS.showMarkdown, showMarkdown.toString());
    }
  }, [title, difficulty, description, showMarkdown, isInitialized]);

  const generateMarkdown = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/generate-markdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: description }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при генерации markdown");
      }

      const data = await response.json();
      setDescription(data.markdown);
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для очистки формы
  const clearForm = () => {
    setTitle("");
    setDifficulty("");
    setDescription("");
    setShowMarkdown(false);
    
    // Очищаем localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Создать задачу</h1>
        </div>
        <Button
          variant="outline"
          onClick={clearForm}
          className="text-sm"
        >
          Очистить форму
        </Button>
      </div>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <PenLine className="w-4 h-4" />
              <Label htmlFor="title" className="font-medium">
                Название задачи
              </Label>
            </div>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название задачи"
              className="border-input"
            />
          </div>

          <div className="w-full md:w-48 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BarChart className="w-4 h-4" />
              <Label htmlFor="difficulty" className="font-medium">
                Сложность
              </Label>
            </div>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Выберите" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Легкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="hard">Сложный</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <PenLine className="w-4 h-4" />
              <Label htmlFor="description" className="font-medium">
                Описание задачи
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <Switch
                id="markdown-preview"
                checked={showMarkdown}
                onCheckedChange={setShowMarkdown}
              />
            </div>
          </div>

          <div className="relative">
            {!showMarkdown ? (
              <div className="border rounded-md border-input bg-card">
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Введите описание задачи"
                  className="min-h-[200px] font-mono text-sm border-none resize-y focus-visible:ring-0"
                />
              </div>
            ) : (
              <div className="border rounded-md border-input bg-background/50 p-6">
                <div className="prose dark:prose-invert prose-pre:bg-secondary/30 prose-pre:border prose-pre:border-border/50 max-w-none">
                  <ReactMarkdown>
                    {description || "*Нет описания...*"}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button 
            onClick={generateMarkdown} 
            disabled={!description || isLoading}
            variant="default"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            {isLoading ? "Генерация..." : "Генерировать Markdown"}
          </Button>
        </div>
      </div>
    </div>
  );
} 