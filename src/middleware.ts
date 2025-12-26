// // src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session_key');
  const sessionKey = sessionCookie?.value;
  // const sessionKey = request.cookies.get('session_key');
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname.startsWith('/login');
  // const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  //  세션 키가 없거나 현재 페이지가 로그인 페이지가 아닐때 로그인 페이지로 리다이렉트
  // if (!sessionKey && !isLoginPage) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }
  //  로그인 안 했는데 보호된 페이지 접근
  if (!sessionKey && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  //  이미 로그인했는데 로그인 페이지 접근
  if (sessionKey && isLoginPage) {
    return NextResponse.redirect(new URL('/main', request.url))
  }

  //  나머지는 모두 허용 (로그인 했거나 로그인 페이지 요청이면)
  return NextResponse.next();
}


export const config = {
  matcher: [
    '/((?!_next|favicon.ico|login|env.js|images|icons|assets|public|api|pds|logo|nexpds.ico|fonts).*)',
  ],
}

