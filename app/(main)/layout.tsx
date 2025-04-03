import { Appbar } from '../components/Appbar';
import { Footer } from '../components/Footer';
import { Toaster } from "sonner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <div className="min-h-screen flex flex-col">
        <Appbar />
        <main className="flex-1 mt-[60px] container mx-auto px-4">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
} 