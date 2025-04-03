"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Trophy, Star, TrendingUp, UserPlus } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

const areaData = [
  { name: "Янв", value: 400 },
  { name: "Фев", value: 300 },
  { name: "Мар", value: 600 },
  { name: "Апр", value: 800 },
  { name: "Май", value: 1500 },
  { name: "Июн", value: 900 },
];

const barData = [
  { name: "Пн", value: 20 },
  { name: "Вт", value: 35 },
  { name: "Ср", value: 45 },
  { name: "Чт", value: 30 },
  { name: "Пт", value: 55 },
  { name: "Сб", value: 15 },
  { name: "Вс", value: 10 },
];

const pieData = [
  { name: "Активные", value: 60 },
  { name: "Завершенные", value: 30 },
  { name: "Отмененные", value: 10 },
];

const COLORS = ["#3b82f6", "#22c55e", "#ef4444"];

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString("ru-RU"));
    
    // Обновляем время каждую минуту
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString("ru-RU"));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Дашборд</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Обновлено:</span>
          <span className="text-sm font-medium">
            {currentTime}
          </span>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активные хакатоны
            </CardTitle>
            <Trophy className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">3</div>
            <p className="text-xs text-muted-foreground">
              +2 за последний месяц
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего пользователей
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">2,853</div>
            <p className="text-xs text-muted-foreground">
              +180 новых пользователей
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активность за неделю
            </CardTitle>
            <Activity className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-500">+12%</div>
            <p className="text-xs text-muted-foreground">
              По сравнению с прошлой неделей
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Средний рейтинг
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">4.8</div>
            <p className="text-xs text-muted-foreground">
              На основе 1,250 оценок
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Рост пользователей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-500" />
              Активность по дням
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-500" />
              Статус хакатонов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex justify-center gap-4">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 