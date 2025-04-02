import { Metadata } from "next"
import { VerifyForm } from "@/app/components/auth/VerifyForm"

export const metadata: Metadata = {
  title: "Подтверждение email | Codigma",
  description: "Подтвердите ваш email адрес",
}

export default function VerifyPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-[#4E7AFF]" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img src="/logo.svg" alt="Codigma" className="h-8" />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Остался последний шаг! Подтвердите ваш email, чтобы начать обучение.
            </p>
            <footer className="text-sm">Команда Codigma</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Подтверждение email
            </h1>
            <p className="text-sm text-muted-foreground">
              Введите код подтверждения, который мы отправили на ваш email
            </p>
          </div>
          <VerifyForm />
        </div>
      </div>
    </div>
  )
} 