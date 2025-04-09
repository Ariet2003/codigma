'use client';

import { useState, useEffect } from 'react';
import { format, differenceInHours } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Calendar, Code, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Цвета для графиков
const COLORS = ['#4E7AFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
const STATUS_COLORS = {
  PENDING: '#F59E0B',
  APPROVED: '#10B981',
  REJECTED: '#EF4444',
  PROCESSING: '#4E7AFF',
  ERROR: '#8B5CF6',
  ACCEPTED: '#10B981'
};

export default function StatisticsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStatistics();
  }, [params.id]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hackathons/${params.id}/statistics`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Загрузка статистики...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Статистика хакатона</h1>
          <p className="text-muted-foreground mt-1">
            Анализ производительности и активности участников
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к хакатону
        </Button>
      </div>

      {/* Карточки с ключевыми метриками */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Участники</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalParticipants}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Задачи</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalTasks}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <Code className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Продолжительность</p>
                <h3 className="text-2xl font-bold mt-1">
                  {differenceInHours(new Date(stats.endDate), new Date(stats.startDate))} ч
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Статус</p>
                <h3 className="text-2xl font-bold mt-1">{stats.isOpen ? 'Открыт' : 'Закрыт'}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Вкладки для разных типов статистики */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="submissions">Решения</TabsTrigger>
          <TabsTrigger value="tasks">Задачи</TabsTrigger>
          <TabsTrigger value="languages">Языки</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* График активности */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>График активности</CardTitle>
              <CardDescription>Распределение решений по времени</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.activityData}>
                    <defs>
                      <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4E7AFF" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4E7AFF" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="submissions" 
                      stroke="#4E7AFF" 
                      fillOpacity={1} 
                      fill="url(#colorSubmissions)" 
                      name="Количество решений" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Статистика заявок (для закрытых хакатонов) */}
          {!stats.isOpen && stats.requestsStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Статистика заявок</CardTitle>
                <CardDescription>Распределение статусов заявок на участие</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.requestsStats}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.requestsStats.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="submissions" className="space-y-6">
          {/* Статистика решений */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика решений</CardTitle>
              <CardDescription>Распределение статусов отправленных решений</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.submissionsStats}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.submissionsStats.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  {stats.submissionsStats.map((stat: any) => {
                    const totalSubmissions = stats.submissionsStats.reduce((sum: number, s: any) => sum + s.value, 0);
                    const percentage = totalSubmissions > 0 ? Math.round((stat.value / totalSubmissions) * 100) : 0;
                    
                    return (
                      <div key={stat.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {stat.name === 'ACCEPTED' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {stat.name === 'REJECTED' && <XCircle className="h-4 w-4 text-red-500" />}
                            {stat.name === 'ERROR' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                            {stat.name === 'PROCESSING' && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                            <span className="font-medium">{stat.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{stat.value}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              stat.name === 'ACCEPTED' ? 'bg-green-500' : 
                              stat.name === 'REJECTED' ? 'bg-red-500' : 
                              stat.name === 'ERROR' ? 'bg-amber-500' : 
                              'bg-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-6">
          {/* Статистика по задачам */}
          <Card>
            <CardHeader>
              <CardTitle>Успешность решения задач</CardTitle>
              <CardDescription>Распределение принятых и отклоненных решений по задачам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.taskStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="accepted" name="Принято" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejected" name="Отклонено" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Детальная статистика по задачам */}
          <Card>
            <CardHeader>
              <CardTitle>Детальная статистика по задачам</CardTitle>
              <CardDescription>Подробная информация о производительности решений</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Задача</th>
                      <th className="text-center py-3 px-4">Всего попыток</th>
                      <th className="text-center py-3 px-4">Успешных решений</th>
                      <th className="text-center py-3 px-4">% успешности</th>
                      <th className="text-center py-3 px-4">Среднее время</th>
                      <th className="text-center py-3 px-4">Средняя память</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.taskDetailedStats.map((task: any) => (
                      <tr key={task.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{task.name}</td>
                        <td className="text-center py-3 px-4">{task.totalAttempts}</td>
                        <td className="text-center py-3 px-4">{task.successfulAttempts}</td>
                        <td className="text-center py-3 px-4">
                          <Badge variant={
                            task.successRate > 50 ? "default" : 
                            task.successRate > 25 ? "secondary" : 
                            "destructive"
                          }>
                            {task.successRate}%
                          </Badge>
                        </td>
                        <td className="text-center py-3 px-4">{task.avgExecutionTime} мс</td>
                        <td className="text-center py-3 px-4">{task.avgMemoryUsage} Б</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="languages" className="space-y-6">
          {/* Распределение языков программирования */}
          <Card>
            <CardHeader>
              <CardTitle>Языки программирования</CardTitle>
              <CardDescription>Распределение решений по языкам программирования</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.languageStats}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.languageStats.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  {stats.languageStats.map((stat: any, index: number) => {
                    const totalLanguages = stats.languageStats.reduce((sum: number, s: any) => sum + s.value, 0);
                    const percentage = totalLanguages > 0 ? Math.round((stat.value / totalLanguages) * 100) : 0;
                    
                    return (
                      <div key={stat.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="font-medium">{stat.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{stat.value}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-primary" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 