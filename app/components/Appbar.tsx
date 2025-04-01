"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { Button } from "./Button";
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
            className={`hover:underline ${
              pathname === link.href ? "text-primary font-medium" : "text-muted-foreground"
            }`}
            prefetch={false}
          >
            {link.name}
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
          <Button variant="outline" onClick={() => signIn()}>
            Войти
          </Button>
          <Button onClick={() => signIn()}>
            Регистрация
          </Button>
        </div>
      )}

      {isLoading && <div className="flex items-center gap-4"></div>}
    </header>
  );
} 