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
            {/* Если путь начинается с /admin, рендерим только children */}
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
} 