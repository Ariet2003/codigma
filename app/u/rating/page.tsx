"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Medal } from "lucide-react";

export default function RatingPage() {
  const users = [
    {
      id: 1,
      rank: 1,
      name: "Александр Иванов",
      points: 2500,
      solved: 48,
      hackathons: 3,
      level: "Гроссмейстер"
    },
    {
      id: 2,
      rank: 2,
      name: "Мария Петрова",
      points: 2350,
      solved: 45,
      hackathons: 2,
      level: "Мастер"
    },
    {
      id: 3,
      rank: 3,
      name: "Дмитрий Сидоров",
      points: 2200,
      solved: 42,
      hackathons: 2,
      level: "Эксперт"
    }
  ];

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "Гроссмейстер":
        return <Badge className="bg-purple-500/10 text-purple-500">{level}</Badge>;
      case "Мастер":
        return <Badge className="bg-blue-500/10 text-blue-500">{level}</Badge>;
      case "Эксперт":
        return <Badge className="bg-green-500/10 text-green-500">{level}</Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Рейтинг участников</h1>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Место</TableHead>
              <TableHead>Участник</TableHead>
              <TableHead>Уровень</TableHead>
              <TableHead className="text-right">Рейтинг</TableHead>
              <TableHead className="text-right">Решено задач</TableHead>
              <TableHead className="text-right">Хакатоны</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getRankIcon(user.rank)}
                    <span>{user.rank}</span>
                  </div>
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{getLevelBadge(user.level)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Star className="h-4 w-4 text-primary" />
                    <span>{user.points}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{user.solved}</TableCell>
                <TableCell className="text-right">{user.hackathons}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 