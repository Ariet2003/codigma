"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Clock, BarChart } from "lucide-react";

export default function TasksPage() {
  const tasks = [
    {
      id: 1,
      title: "Алгоритм сортировки",
      description: "Реализуйте эффективный алгоритм сортировки массива",
      difficulty: "Средняя",
      points: 100,
      completions: 45,
      timeLimit: "1 секунда",
      memoryLimit: "256 MB",
      tags: ["Алгоритмы", "Сортировка", "Массивы"]
    },
    {
      id: 2,
      title: "Динамическое программирование",
      description: "Решите задачу о рюкзаке с использованием динамического программирования",
      difficulty: "Сложная",
      points: 200,
      completions: 23,
      timeLimit: "2 секунды",
      memoryLimit: "512 MB",
      tags: ["ДП", "Оптимизация", "Рюкзак"]
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Легкая":
        return "bg-green-500/10 text-green-500";
      case "Средняя":
        return "bg-yellow-500/10 text-yellow-500";
      case "Сложная":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Задачи</h1>
      </div>

      <div className="grid gap-6">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{task.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                </div>
                <Badge variant="secondary" className={getDifficultyColor(task.difficulty)}>
                  {task.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    <span>{task.points} баллов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span>{task.completions} решений</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{task.timeLimit}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 