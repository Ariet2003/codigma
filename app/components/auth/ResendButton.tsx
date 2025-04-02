"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

export function ResendButton() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleResend = async () => {
    if (!email) {
      toast.error("Email не найден");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data);
      }

      toast.success("Новый код отправлен", {
        duration: 5000,
        description: (
          <div className="mt-2">
            <p>Мы отправили новый код подтверждения на</p>
            <p className="font-medium">{email}</p>
            <p className="text-sm mt-1">Проверьте папку "Спам", если не видите письмо</p>
          </div>
        )
      });
    } catch (error: any) {
      toast.error(error.message || "Произошла ошибка при отправке кода");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="font-medium text-primary hover:text-primary/90 dark:text-white dark:hover:text-white/90 transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleResend}
      disabled={isLoading}
    >
      {isLoading ? "Отправка..." : "Отправить повторно"}
    </button>
  );
} 