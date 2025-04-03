"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  FileText,
  Star,
  PlusCircle,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
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
    icon: PlusCircle
  },
  {
    name: "Создать задачу",
    href: "/admin/tasks/create",
    icon: PlusCircle
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div 
      className={cn(
        "flex h-full flex-col bg-background border-r transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <span className="font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Админ панель
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </div>
      
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Выйти" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && "Выйти"}
        </button>
      </div>
    </div>
  );
} 