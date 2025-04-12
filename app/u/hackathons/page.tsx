"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, Users, Clock } from "lucide-react";

export default function HackathonsPage() {
  const hackathons = [
    {
      id: 1,
      title: "AI Innovation Challenge",
      description: "Создайте инновационное решение с использованием ИИ",
      startDate: "2024-04-01",
      endDate: "2024-04-03",
      participants: 120,
      status: "Регистрация открыта",
      prize: "500 000 ₽"
    },
    {
      id: 2,
      title: "Web3 Development",
      description: "Разработка децентрализованных приложений",
      startDate: "2024-04-15",
      endDate: "2024-04-17",
      participants: 85,
      status: "Скоро",
      prize: "300 000 ₽"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Хакатоны</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {hackathons.map((hackathon) => (
          <Card key={hackathon.id} className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{hackathon.title}</CardTitle>
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {hackathon.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(hackathon.startDate).toLocaleDateString("ru-RU")} - {new Date(hackathon.endDate).toLocaleDateString("ru-RU")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{hackathon.participants} участников</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{hackathon.status}</span>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    Призовой фонд: {hackathon.prize}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 