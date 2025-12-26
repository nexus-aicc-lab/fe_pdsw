// // src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionKey = request.cookies.get('session_key');
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  // ✅ 세션 키가 없거나 현재 페이지가 로그인 페이지가 아닐때 로그인 페이지로 리다이렉트
  if (!sessionKey && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ✅ 나머지는 모두 허용 (로그인 했거나 로그인 페이지 요청이면)
  return NextResponse.next();
}


export const config = {
  matcher: [
    '/((?!_next|favicon.ico|login|env.js|images|icons|assets|public|api|pds|logo|nexpds.ico|fonts).*)',
  ],
}

