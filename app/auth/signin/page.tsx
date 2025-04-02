import { Metadata } from "next";
import { SignInForm } from "@/app/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Вход | Codigma",
  description: "Войдите в свой аккаунт Codigma",
};

export default function SignInPage() {
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
              Добро пожаловать обратно! Войдите, чтобы продолжить свой путь к совершенству.
            </p>
            <footer className="text-sm">Команда Codigma</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Войти в аккаунт
            </h1>
            <p className="text-sm text-muted-foreground">
              Введите свои данные для входа
            </p>
          </div>
          <SignInForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <a
              href="/auth/signup"
              className="underline underline-offset-4 hover:text-primary"
            >
              Зарегистрироваться
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 