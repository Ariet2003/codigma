import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Получаем токен из куки
  const isAuthenticated = request.cookies.has("admin-token");
  const { pathname } = request.nextUrl;

  // Пропускаем запросы к API аутентификации
  if (pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next();
  }

  // Защита API эндпоинтов админ-панели
  if (pathname.startsWith("/api/dashboard") || pathname.startsWith("/api/admin")) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }
  }

  // Если пользователь авторизован и пытается зайти на страницу входа или главную
  if (isAuthenticated && (pathname === "/admin/signin" || pathname === "/")) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Если пользователь не авторизован и пытается зайти в админку (кроме страницы входа)
  if (!isAuthenticated && pathname.startsWith("/admin") && pathname !== "/admin/signin") {
    return NextResponse.redirect(new URL("/admin/signin", request.url));
  }

  return NextResponse.next();
}

// Указываем, для каких путей должен срабатывать middleware
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/dashboard/:path*",
    "/api/admin/:path*"
  ]
}; 