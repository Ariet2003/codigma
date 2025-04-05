"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home,
  Trophy,
  FileText,
  Settings,
  LogOut,
  PlusCircle,
  BookOpen
} from "lucide-react";

const menuItems = [
  {
    title: "Главная",
    icon: Home,
    href: "/dashboard"
  },
  {
    title: "Хакатоны",
    icon: Trophy,
    href: "/hackathons"
  },
  {
    title: "Задачи",
    icon: BookOpen,
    href: "/tasks"
  }
];

const adminItems = [
  {
    title: "Создать хакатон",
    icon: PlusCircle,
    href: "/admin/hackathons/create"
  },
  {
    title: "Создать задачу",
    icon: PlusCircle,
    href: "/admin/tasks/create"
  }
];

const bottomItems = [
  {
    title: "Настройки",
    icon: Settings,
    href: "/settings"
  },
  {
    title: "Выйти",
    icon: LogOut,
    href: "/logout"
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "relative min-h-screen border-r border-color-[hsl(var(--border))] bg-background transition-all duration-300",
      isCollapsed ? "w-[80px]" : "w-[280px]"
    )}>
      <ScrollArea className="h-full py-6">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link key={item.title} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2",
                      pathname === item.href ? "bg-[#4E7AFF] text-white" : "hover:bg-[#4E7AFF]/10 hover:text-[#4E7AFF]",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isCollapsed && "mr-0")} />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          <div className="px-3 py-2">
            <h2 className={cn(
              "mb-2 px-4 text-lg font-semibold tracking-tight text-[#4E7AFF]",
              isCollapsed && "text-center text-sm"
            )}>
              {!isCollapsed ? "Администрирование" : "Админ"}
            </h2>
            <div className="space-y-1">
              {adminItems.map((item) => (
                <Link key={item.title} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2",
                      pathname === item.href ? "bg-[#4E7AFF] text-white" : "hover:bg-[#4E7AFF]/10 hover:text-[#4E7AFF]",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isCollapsed && "mr-0")} />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-0 right-0 px-3 py-2">
          <div className="space-y-1">
            {bottomItems.map((item) => (
              <Link key={item.title} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2",
                    "hover:bg-[#4E7AFF]/10 hover:text-[#4E7AFF]",
                    isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isCollapsed && "mr-0")} />
                  {!isCollapsed && <span>{item.title}</span>}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 z-10 h-8 w-8 rounded-full border border-color-[hsl(var(--border))] bg-background hover:bg-[#4E7AFF]/10 hover:text-[#4E7AFF]"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? "→" : "←"}
      </Button>
    </div>
  );
} 