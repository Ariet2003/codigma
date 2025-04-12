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
      <UserHeader />
      <main className="min-h-screen">
        <div className="container mx-auto px-8">
          {children}
        </div>
      </main>
    </>
  );
} 