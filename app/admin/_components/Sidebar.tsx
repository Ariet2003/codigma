"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  FileText,
  Star,
  Plus,
  Users,
  Settings,
  LogOut
} from "lucide-react";

const navigation = [
  {
    name: "Дашборд",
    href: "/admin/dashboard",
    icon: LayoutDashboard
  },
  {
    name: "Хакатоны",
    href: "/admin/hackathons",
    icon: Trophy
  },
  {
    name: "Отчеты",
    href: "/admin/reports",
    icon: FileText
  },
  {
    name: "Рейтинг",
    href: "/admin/rating",
    icon: Star
  },
  {
    name: "Создать хакатон",
    href: "/admin/hackathons/create",
    icon: Plus
  },
  {
    name: "Создать задачу",
    href: "/admin/tasks/create",
    icon: Plus
  },
  {
    name: "Пользователи",
    href: "/admin/users",
    icon: Users
  },
  {
    name: "Настройки",
    href: "/admin/settings",
    icon: Settings
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/auth/signout", {
        method: "POST"
      });

      if (response.ok) {
        router.push("/admin/signin");
      }
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-semibold">Админ панель</span>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-md"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Выйти
        </button>
      </div>
    </div>
  );
} 