'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import ParticipationRequests from "@/components/ui/participation-requests";
import { useToast } from "@/components/ui/use-toast";

export default function ParticipationRequestsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { toast } = useToast();

  // Обработчик для обновления данных при возврате через стрелки браузера
  useEffect(() => {
    const handlePopState = () => {
      router.refresh();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  const handleBack = () => {
    // Обновляем страницу хакатона при возврате
    router.refresh();
    router.push(`/admin/hackathons/${params.id}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Заявки на участие в хакатоне</h1>
        <Button variant="outline" className="gap-2" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          Назад к хакатону
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Заявки на участие</CardTitle>
        </CardHeader>
        <CardContent>
          <ParticipationRequests hackathonId={params.id} />
        </CardContent>
      </Card>
    </div>
  );
} 