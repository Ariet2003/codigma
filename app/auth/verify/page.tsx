import { Metadata } from "next"
import { VerifyForm } from "@/app/components/auth/VerifyForm"
import { ResendButton } from "@/app/components/auth/ResendButton"

export const metadata: Metadata = {
  title: "Подтверждение Email | Codigma",
  description: "Подтвердите ваш email адрес",
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background">
      <div className="w-full max-w-md">
        <div className="bg-card/50 p-8 rounded-3xl shadow-2xl border border-border/50 backdrop-blur-xl">
          <div className="flex flex-col items-center space-y-2 text-center mb-8">
            <div className="w-40 h-20 relative flex items-center justify-center">
              <img
                src="/Codigma-logo-dark.svg"
                alt="Codigma"
                className="hidden dark:block w-full h-auto transition-opacity duration-300"
              />
              <img
                src="/Codigma-logo-light.svg"
                alt="Codigma"
                className="block dark:hidden w-full h-auto transition-opacity duration-300"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Подтверждение Email
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm">
              Введите код подтверждения, отправленный на ваш email
            </p>
          </div>

          <VerifyForm />

          <p className="text-center text-sm text-muted-foreground mt-8">
            Не получили код?{" "}
            <ResendButton />
          </p>
        </div>
      </div>
    </div>
  )
} 