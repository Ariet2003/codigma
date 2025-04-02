import './globals.css';
import type { Metadata } from 'next';
import { Appbar } from './components/Appbar';
import { Footer } from './components/Footer';
import { ThemeProvider } from './providers/theme-provider';
import { SessionProvider } from './providers/session-provider';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Codigma - Платформа для соревнований по программированию',
  description: 'Стань частью сообщества кодеров, решай задачи и покоряй топы лидеров на Codigma',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen flex flex-col">
              <Appbar />
              <main className="flex-1 mt-[60px] container mx-auto px-4">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
} 