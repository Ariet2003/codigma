"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

export function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Email не найден")
      return
    }

    const code = verificationCode.join("")
    if (code.length !== 6) {
      toast.error("Введите код полностью")
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      })

      const data = await response.text()

      if (!response.ok) {
        throw new Error(data)
      }

      toast.success("Email подтвержден")

      // Получаем сохраненный пароль
      const encodedPassword = localStorage.getItem(`temp_password_${email}`)
      if (!encodedPassword) {
        router.push("/auth/signin")
        return
      }

      const password = atob(encodedPassword) // Декодируем пароль из base64
      
      // Выполняем автоматический вход
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        console.error("Ошибка входа:", signInResult.error)
        toast.error("Не удалось выполнить вход автоматически")
        router.push("/auth/signin")
      } else {
        localStorage.removeItem(`temp_password_${email}`)
        router.push("/u/profile")
      }
    } catch (error: any) {
      toast.error(error.message || "Что-то пошло не так")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Проверка..." : "Подтвердить"}
      </Button>
    </form>
  )
} 