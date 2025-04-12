"use client";

import { usePathname } from "next/navigation";
import { UserHeader } from "./_components/UserHeader";
import { Toaster } from "sonner";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="min-h-screen bg-background">
        <UserHeader />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </>
  );
} 