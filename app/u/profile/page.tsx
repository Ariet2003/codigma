"use client";

import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Trophy,
  Star,
  Target,
  BarChart2,
  Calendar,
  Edit,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();

  // Временные данные (в реальном приложении будут из БД)
  const stats = {
    легкие: { решено: 20, всего: 871, процент: (20 / 871) * 100 },
    средние: { решено: 2, всего: 1821, процент: (2 / 1821) * 100 },
    сложные: { решено: 0, всего: 819, процент: 0 },
    всегоРешено: 22,
    всегоЗадач: 3511,
    рейтинг: 1250,
    местоВРейтинге: 42,
    успешныеОтправки: 60,
    всегоОтправок: 85,
    процентУспеха: Math.round((60 / 85) * 100),
    активныхДней: 17,
    максСерия: 8,
    участиеВХакатонах: 3,
    победыВХакатонах: 1
  };

  const submissions = [
    { date: "2024-03-15", count: 5, type: "success" },
    { date: "2024-03-14", count: 3, type: "error" },
    // ... другие отправки
  ];

  return (
    <div className="container py-6 space-y-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Левая колонка - Профиль */}
        <div className="col-span-12 md:col-span-3 space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-4xl font-bold text-primary">
                  {session?.user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">{session?.user?.name || "Пользователь"}</h2>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Edit className="h-4 w-4" />
                Редактировать профиль
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Рейтинг</span>
                  <span className="font-medium">{stats.рейтинг}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Место в рейтинге</span>
                  <span className="font-medium">#{stats.местоВРейтинге}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Участие в хакатонах</span>
                  <span className="font-medium">{stats.участиеВХакатонах}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Победы в хакатонах</span>
                  <span className="font-medium">{stats.победыВХакатонах}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Статистика решений */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Статистика решений</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-500">Легкий</span>
                  <span>{stats.легкие.решено}/{stats.легкие.всего}</span>
                </div>
                <Progress value={stats.легкие.процент} className="h-2 bg-emerald-100">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${stats.легкие.процент}%` }} />
                </Progress>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-500">Средний</span>
                  <span>{stats.средние.решено}/{stats.средние.всего}</span>
                </div>
                <Progress value={stats.средние.процент} className="h-2 bg-yellow-100">
                  <div className="h-full bg-yellow-500 transition-all" style={{ width: `${stats.средние.процент}%` }} />
                </Progress>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-500">Сложный</span>
                  <span>{stats.сложные.решено}/{stats.сложные.всего}</span>
                </div>
                <Progress value={stats.сложные.процент} className="h-2 bg-red-100">
                  <div className="h-full bg-red-500 transition-all" style={{ width: `${stats.сложные.процент}%` }} />
                </Progress>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Всего решено</span>
                <span className="font-medium">{stats.всегоРешено} из {stats.всегоЗадач}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Успешные отправки</span>
                <span className="font-medium text-emerald-500">{stats.успешныеОтправки}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Процент успеха</span>
                <span className="font-medium">{stats.процентУспеха}%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Правая колонка - Активность */}
        <div className="col-span-12 md:col-span-9 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Активность решений</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.активныхДней} активных дней • Макс. серия: {stats.максСерия} дней
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-4 w-4" />
                  2024
                </Badge>
              </div>
            </div>

            {/* График активности */}
            <div className="h-[200px] bg-muted/20 rounded-lg flex items-center justify-center">
              Здесь будет график активности
            </div>
          </Card>

          {/* Последние отправки */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Последние отправки</h3>
            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/5 rounded-lg">
                  <div className="flex items-center gap-4">
                    {submission.type === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">Задача #{submission.count}</p>
                      <p className="text-sm text-muted-foreground">{submission.date}</p>
                    </div>
                  </div>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 