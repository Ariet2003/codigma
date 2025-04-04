"use client";

import * as React from "react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserContextMenu({ session }: { session: Session }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full overflow-hidden">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User avatar"}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {session.user?.name?.[0] || "U"}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg p-1">
        <DropdownMenuItem className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm cursor-pointer">
          <Link href="/profile" className="w-full">
            Профиль
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm cursor-pointer">
          <Link href="/settings" className="w-full">
            Настройки
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm cursor-pointer text-red-500"
          onClick={() => signOut()}
        >
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 