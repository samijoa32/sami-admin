/**
 * 관리자 라우트 보호 미들웨어
 * /admin/** 경로 접근 시 인증 쿠키 확인
 *
 * 적용 위치: 프로젝트 루트의 middleware.ts (이미 있다면 admin 부분만 병합)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "sami_admin_auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin 으로 시작하는 모든 경로 보호 (로그인 페이지 자체는 제외)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const authCookie = request.cookies.get(ADMIN_COOKIE_NAME);

    if (!authCookie || authCookie.value !== "verified") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
