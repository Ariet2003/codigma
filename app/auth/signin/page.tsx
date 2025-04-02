import { Metadata } from "next";
import { SignInForm } from "@/app/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Вход | Codigma",
  description: "Войдите в свой аккаунт Codigma",
};

export default function SignInPage() {
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
              С возвращением!
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm">
              Войдите в свой аккаунт, чтобы продолжить
            </p>
          </div>

          <SignInForm />

          <p className="text-center text-sm text-muted-foreground mt-8">
            Нет аккаунта?{" "}
            <a
              href="/auth/signup"
              className="font-medium text-primary hover:text-primary/90 dark:text-white dark:hover:text-white/90 transition-colors hover:underline"
            >
              Зарегистрироваться
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 