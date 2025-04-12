import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminAuthenticated = request.cookies.has("admin-token");
  const isUserAuthenticated = request.cookies.has("next-auth.session-token");

  // Пропускаем запросы к API аутентификации
  if (pathname.startsWith("/api/admin/auth") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Если пользователь админ
  if (isAdminAuthenticated) {
    // Если админ пытается зайти на страницу входа, лендинг или пользовательские страницы
    if (pathname === "/admin/signin" || pathname === "/" || pathname.startsWith("/u/")) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // Если обычный пользователь (но не админ)
  if (isUserAuthenticated && !isAdminAuthenticated) {
    // Если пользователь пытается зайти на лендинг или страницу входа
    if (pathname === "/" || pathname === "/auth/signin") {
      return NextResponse.redirect(new URL("/u/profile", request.url));
    }

    // Если пользователь пытается зайти в админку
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/u/profile", request.url));
    }
  }

  // Защита админских роутов
  if (pathname.startsWith("/admin") && !isAdminAuthenticated && pathname !== "/admin/signin") {
    return NextResponse.redirect(new URL("/admin/signin", request.url));
  }

  // Защита пользовательских роутов
  if (pathname.startsWith("/u/") && !isUserAuthenticated) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Защита API эндпоинтов админ-панели
  if ((pathname.startsWith("/api/dashboard") || pathname.startsWith("/api/admin")) && !isAdminAuthenticated) {
    return NextResponse.json(
      { error: "Не авторизован" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

// Указываем, для каких путей должен срабатывать middleware
export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/u/:path*",
    "/api/dashboard/:path*",
    "/api/admin/:path*",
    "/auth/signin"
  ]
}; 