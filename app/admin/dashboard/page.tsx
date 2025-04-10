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

const COLORS = ["#3b82f6", "#22c55e", "#ef4444"];

// Кастомный тултип для графика роста пользователей
const CustomTooltipGrowth = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium">{label}</p>
        <p className="text-sm">
          Новых пользователей: <span className="font-medium">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Кастомный тултип для графика активности
const CustomTooltipActivity = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const details = payload[0].payload.details;
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium">{label}</p>
        <div className="space-y-1 mt-1">
          <p className="text-sm">
            Решения задач: <span className="font-medium">{details.submissions}</span>
          </p>
          <p className="text-sm">
            Заявки на участие: <span className="font-medium">{details.requests}</span>
          </p>
          <p className="text-sm">
            Новые участники: <span className="font-medium">{details.participants}</span>
          </p>
          <p className="text-sm">
            Новые пользователи: <span className="font-medium">{details.newUsers}</span>
          </p>
          <p className="text-sm font-medium mt-2 pt-2 border-t">
            Всего активностей: {payload[0].value}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Кастомный тултип для круговой диаграммы хакатонов
const CustomTooltipHackathon = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="text-sm">
          {payload[0].name}: <span className="font-medium">{payload[0].value} шт.</span>
        </p>
      </div>
    );
  }
  return null;
};

// Кастомный тултип для круговой диаграммы заявок
const CustomTooltipRequest = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="text-sm">
          {payload[0].name}: <span className="font-medium">{payload[0].value} заявок</span>
        </p>
      </div>
    );
  }
  return null;
};

interface DashboardData {
  stats: {
    activeHackathons: number;
    totalUsers: number;
    newUsers: number;
    submissionRate: number;
  };
  userGrowth: Array<{
    name: string;
    value: number;
  }>;
  weeklyActivity: Array<{
    name: string;
    value: number;
    details: {
      submissions: number;
      requests: number;
      participants: number;
      newUsers: number;
    };
  }>;
  hackathonStatuses: Array<{
    name: string;
    value: number;
  }>;
  requestStatuses: Array<{
    name: string;
    value: number;
  }>;
}

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard");
      if (!response.ok) throw new Error("Ошибка при загрузке данных");
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Обновляем данные каждые 5 минут
    const dataInterval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(dataInterval);
  }, []);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString("ru-RU"));
    
    // Обновляем время каждую минуту
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString("ru-RU"));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
            <div className="text-2xl font-bold text-blue-500">{data.stats.activeHackathons}</div>
            <p className="text-xs text-muted-foreground">
              Сейчас проходят
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
            <div className="text-2xl font-bold text-green-500">{data.stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{data.stats.newUsers} за последний месяц
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
            <div className="text-2xl font-bold text-violet-500">
              {data.weeklyActivity.reduce((sum, day) => sum + day.value, 0)} действий
            </div>
            <p className="text-xs text-muted-foreground">
              За последние 7 дней
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Успешные решения
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{data.stats.submissionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Процент успешных решений
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Рост пользователей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.userGrowth}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltipGrowth />} />
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

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-500" />
              Активность по дням
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltipActivity />} />
                  <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
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
                    data={data.hackathonStatuses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => (
                      `${name}\n${(percent * 100).toFixed(0)}%`
                    )}
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.hackathonStatuses.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipHackathon />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-500" />
              Статус заявок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.requestStatuses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => (
                      `${name}\n${(percent * 100).toFixed(0)}%`
                    )}
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.requestStatuses.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipRequest />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 