"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./_components/Sidebar";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSignInPage = pathname === "/admin/signin";

  if (isSignInPage) {
    return (
      <>
        <Toaster 
          richColors 
          position="top-center"
          toastOptions={{
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
            },
            className: "text-sm font-medium",
          }}
        />
        <div className="min-h-screen">
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster 
        richColors 
        position="top-center"
        toastOptions={{
          style: {
            background: "hsl(var(--card))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
          className: "text-sm font-medium",
        }}
      />
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
} 