import { Metadata } from "next";
import { ForgotPasswordForm } from "@/app/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Восстановление пароля | Codigma",
  description: "Восстановите доступ к вашему аккаунту",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background">
      <div className="w-full max-w-md">
        <div className="bg-card/50 p-8 rounded-3xl shadow-2xl border border-border/50 backdrop-blur-xl">
          <div className="flex flex-col items-center space-y-2 text-center mb-8">
            <div className="w-40 h-16 relative flex items-center justify-center">
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
              Восстановление пароля
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm">
              Введите ваш email, и мы отправим вам код для сброса пароля
            </p>
          </div>

          <ForgotPasswordForm />

          <p className="text-center text-sm text-muted-foreground mt-8">
            Вспомнили пароль?{" "}
            <a
              href="/auth/signin"
              className="font-medium text-primary hover:text-primary/90 dark:text-white dark:hover:text-white/90 transition-colors hover:underline"
            >
              Войти
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 