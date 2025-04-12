"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Trophy, BookOpen, Star, User } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";

const navigation = [
  {
    name: "Хакатоны",
    href: "/u/hackathons",
    icon: Trophy
  },
  {
    name: "Задачи",
    href: "/u/tasks",
    icon: BookOpen
  },
  {
    name: "Рейтинг",
    href: "/u/rating",
    icon: Star
  },
  {
    name: "Профиль",
    href: "/u/profile",
    icon: User
  }
];

export function UserHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-[hsl(222.2,84%,4.9%)]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(222.2,84%,4.9%)]/60">
      <div className="container flex h-16 items-center justify-between px-8">
        {/* Логотип */}
        <div className="w-[200px]">
          <Link href="/u/profile" className="flex items-center transition-transform hover:scale-105">
            <img
              className="hidden dark:block w-32 h-auto"
              src="/App-logo-dark.svg"
              alt="Dark mode logo"
            />
            <img
              className="block dark:hidden w-32 h-auto"
              src="/App-logo-light.svg"
              alt="Light mode logo"
            />
          </Link>
        </div>

        {/* Навигация */}
        <nav className="flex items-center justify-center flex-1">
          <div className="flex items-center space-x-8 text-sm font-medium">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center space-x-2 py-2 px-4 rounded-full transition-all duration-300",
                    isActive
                      ? "bg-primary/10 text-primary shadow-[0_0_0_1px] shadow-primary/20"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 transition-all duration-300",
                    isActive 
                      ? "scale-110 text-primary"
                      : "text-muted-foreground group-hover:text-primary group-hover:scale-110"
                  )} />
                  <span className={cn(
                    "relative transition-all duration-300",
                    isActive && "font-semibold"
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Правая часть */}
        <div className="flex items-center justify-end space-x-4 w-[200px]">
          <ModeToggle />
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 rounded-full transition-transform hover:scale-105 active:scale-95"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40 hover:ring-[3px]">
                    <AvatarImage src={session.user.image || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 animate-in slide-in-from-top-2 duration-200">
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer transition-colors"
                >
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
} 