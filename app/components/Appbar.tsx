"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggle";
import UserContextMenu from "./UserContextMenu";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";

export function Appbar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();
  const isLoading = sessionStatus === "loading";

  const links: { name: string; href: string }[] = [
    {
      name: "Возможности",
      href: "/#features",
    },
    {
      name: "Языки",
      href: "/#languages",
    },
    {
      name: "Как это работает",
      href: "/#how-it-works",
    },
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('/#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <Link href="/" className="flex items-center gap-2" prefetch={false}>
        <img
          className="hidden dark:block w-40 h-auto"
          src="/App-logo-dark.svg"
          alt="Dark mode logo"
        />
        <img
          className="block dark:hidden w-40 h-auto"
          src="/App-logo-light.svg"
          alt="Light mode logo"
        />
      </Link>
      <nav className="hidden md:flex items-center gap-6">
        {links.map((link, index) => (
          <Link
            href={link.href}
            key={index}
            onClick={(e) => handleSmoothScroll(e, link.href)}
            className={`text-base font-medium transition-all relative group ${
              pathname === link.href ? "text-[#4E7AFF]" : "text-gray-600 dark:text-gray-300"
            }`}
            prefetch={false}
          >
            {link.name}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4E7AFF] transition-all group-hover:w-full"></span>
          </Link>
        ))}
      </nav>
      {!isLoading && session?.user && (
        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserContextMenu session={session} />
        </div>
      )}

      {!isLoading && !session?.user && (
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link href="/auth/signin">
            <Button 
              variant="outline"
              className="px-6 py-2 rounded-lg border border-[#4E7AFF] text-[#4E7AFF] dark:text-white font-medium transition-all hover:bg-[#4E7AFF]/10 hover:scale-105"
            >
              Войти
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button 
              className="px-6 py-2 rounded-lg bg-[#4E7AFF] text-white font-medium transition-all hover:bg-[#4E7AFF]/90 hover:scale-105"
            >
              Регистрация
            </Button>
          </Link>
        </div>
      )}

      {isLoading && <div className="flex items-center gap-4"></div>}
    </header>
  );
} 