"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import CreateHackathon from "../../create/page";

export default function EditHackathonPage() {
  const router = useRouter();
  const params = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const response = await fetch(`/api/hackathons/${params.id}`);
        if (!response.ok) throw new Error("Ошибка при загрузке хакатона");
        const data = await response.json();
        
        // Проверяем, не начался ли хакатон
        const startDate = new Date(data.startDate);
        if (new Date() >= startDate) {
          router.push("/admin/hackathons");
          return;
        }

        setHackathon(data);
      } catch (error) {
        console.error("Ошибка при загрузке хакатона:", error);
        router.push("/admin/hackathons");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHackathon();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Загрузка...
        </div>
      </div>
    );
  }

  return <CreateHackathon isEditing={true} hackathonData={hackathon} />;
} 