"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

type TimerProps = {
  startDate: string;
  endDate: string;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export default function HackathonTimer({ startDate, endDate }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      // Определяем, начался ли хакатон
      if (now >= start) {
        setIsStarted(true);
      }

      // Определяем, закончился ли хакатон
      if (now >= end) {
        setIsFinished(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      // Вычисляем оставшееся время
      const targetDate = now < start ? start : end;
      const difference = targetDate - now;

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    // Обновляем таймер каждую секунду
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Инициализируем таймер
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [startDate, endDate]);

  if (isFinished) {
    return (
      <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
            <Clock className="w-6 h-6" />
            Хакатон завершен
          </h2>
          <p className="text-red-600 dark:text-red-400">
            Таймер завершён — участники больше не могут решать задачи.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isStarted ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"}>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Clock className="w-6 h-6" />
          {isStarted ? "До окончания хакатона" : "До начала хакатона"}
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{timeLeft.days}</div>
            <div className="text-sm text-blue-500 dark:text-blue-400">дней</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{timeLeft.hours}</div>
            <div className="text-sm text-blue-500 dark:text-blue-400">часов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{timeLeft.minutes}</div>
            <div className="text-sm text-blue-500 dark:text-blue-400">минут</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{timeLeft.seconds}</div>
            <div className="text-sm text-blue-500 dark:text-blue-400">секунд</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 