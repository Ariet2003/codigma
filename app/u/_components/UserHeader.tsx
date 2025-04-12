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
import Image from "next/image";

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

function UserNav() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="flex items-center gap-4">
      <ModeToggle />
      {session?.user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-10 w-10 rounded-full hover:bg-primary/15 transition-all duration-300 hover:scale-105 hover:shadow-[0_3px_12px_-2px_rgba(0,0,0,0.25)]"
            >
              <Avatar className="h-10 w-10 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40 hover:ring-[3px]">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 shadow-xl border border-primary/20 animate-in fade-in-0 zoom-in-95">
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="text-red-600 hover:text-red-700 cursor-pointer font-medium transition-colors hover:bg-red-50"
            >
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export function UserHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/95 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.2)]">
      <div className="container mx-auto px-8">
        <div className="flex h-16 items-center">
          <div className="flex w-full items-center justify-between md:w-auto md:flex-1">
            <Link href="/" className="flex items-center group">
              <Image
                src="/App-logo-dark.svg"
                alt="Codigma"
                width={120}
                height={28}
                className="h-7 w-auto hidden dark:block transition-all duration-300 group-hover:scale-105"
              />
              <Image
                src="/App-logo-light.svg"
                alt="Codigma"
                width={120}
                height={28}
                className="h-7 w-auto block dark:hidden transition-all duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          <nav className="hidden md:flex flex-1 items-center justify-center">
            <div className="flex space-x-2 bg-muted/80 p-1.5 rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-background shadow-md text-primary scale-[1.02] shadow-[0_3px_6px_-2px_rgba(0,0,0,0.15)]"
                        : "text-muted-foreground/90 hover:text-primary hover:bg-background/80 hover:scale-[1.02] hover:shadow-sm"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 transition-all duration-300",
                      isActive ? "text-primary scale-110" : "text-muted-foreground/90",
                      "group-hover:text-primary group-hover:scale-110"
                    )} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="flex flex-1 items-center justify-end">
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
} 