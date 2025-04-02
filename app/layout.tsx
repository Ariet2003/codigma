import './globals.css';
import type { Metadata } from 'next';
import { Appbar } from './components/Appbar';
import { Footer } from './components/Footer';
import { ThemeProvider } from '../components/theme-provider';
import { SessionProvider } from './providers/session-provider';
import { Toaster } from "sonner";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

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
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster richColors position="top-center" />
            <div className="min-h-screen flex flex-col">
              <Appbar />
              <main className="flex-1 mt-[60px] container mx-auto px-4">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
} 