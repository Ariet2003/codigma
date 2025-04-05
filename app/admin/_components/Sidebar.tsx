"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-toggle";
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
  ChevronRight,
  BookOpen
} from "lucide-react";

const mainNavigation = [
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
    name: "Задачи",
    href: "/admin/tasks",
    icon: BookOpen
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
  }
];

const managementNavigation = [
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
  }
];

const settingsNavigation = [
  {
    name: "Настройки",
    href: "/admin/settings",
    icon: Settings
  }
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
        <div className="space-y-1">
          {mainNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                pathname === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </div>

        <div className="my-4 h-px bg-border" />

        <div className="space-y-1">
          {managementNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                pathname === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </div>

        <div className="my-4 h-px bg-border" />

        <div className="space-y-1">
          {settingsNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                pathname === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t p-2 space-y-2">
        <div className="flex items-center gap-2 px-1.5 py-2">
          <ModeToggle />
        </div>
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