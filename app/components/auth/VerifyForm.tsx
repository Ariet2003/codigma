"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { signIn } from "next-auth/react"

export function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return // Предотвращаем ввод более одного символа

    const newCode = [...verificationCode]
    newCode[index] = value

    setVerificationCode(newCode)

    // Автоматически переходим к следующему полю
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // При нажатии Backspace переходим к предыдущему полю
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const code = verificationCode.join("")
      const email = searchParams.get("email")

      if (!email) {
        throw new Error("Email не найден")
      }

      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      toast({
        title: "Успешно",
        description: "Email подтвержден",
      })

      // Автоматический вход после верификации
      const encodedPassword = localStorage.getItem(`temp_password_${email}`);
      if (!encodedPassword) {
        router.push("/auth/signin");
        return;
      }

      const password = atob(encodedPassword); // Декодируем пароль из base64
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        console.error("Ошибка входа:", signInResult.error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось выполнить вход автоматически",
        });
        router.push("/auth/signin");
      } else {
        localStorage.removeItem(`temp_password_${email}`);
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Произошла ошибка при верификации",
      })
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between gap-2">
        {verificationCode.map((digit, index) => (
          <input
            key={index}
            id={`code-${index}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            className="h-12 w-12 rounded-lg border border-input bg-transparent text-center text-xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isLoading}
            required
          />
        ))}
      </div>
      <Button className="w-full" disabled={isLoading}>
        {isLoading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
        Подтвердить
      </Button>
    </form>
  )
} 