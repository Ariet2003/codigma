import type { Metadata } from "next";
import Image from "next/image";
import { AdminSignInForm } from "@/app/components/auth/AdminSignInForm";

export const metadata: Metadata = {
  title: "Вход в админ-панель | Codigma",
  description: "Вход в административную панель Codigma",
};

export default function AdminSignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background/10 to-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card/50 backdrop-blur-xl rounded-2xl shadow-2xl">
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-40">
              <Image
                src="/Codigma-logo-light.svg"
                alt="Codigma"
                fill
                className="dark:hidden"
                priority
              />
              <Image
                src="/Codigma-logo-dark.svg"
                alt="Codigma"
                fill
                className="hidden dark:block"
                priority
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Вход в админ-панель</h1>
          <p className="text-sm text-muted-foreground">
            Введите данные для входа в административную панель
          </p>
        </div>

        <AdminSignInForm />
      </div>
    </div>
  );
} 