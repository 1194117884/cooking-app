import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要认证的路由（前缀匹配）
const protectedRoutes = [
  '/settings',
  '/members',
  '/preferences',
  '/planner',
  '/shopping',
  '/recommend',
  '/nutrition',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 获取 token（优先从 cookie）
  const token = request.cookies.get('token')?.value;

  // 检查是否需要认证
  const needsAuth = protectedRoutes.some((route) => pathname.startsWith(route));

  // 如果访问保护路由但没有 token，重定向到登录页
  if (needsAuth && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 如果已登录访问认证页面，重定向到首页
  if (pathname.startsWith('/auth') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/settings/:path*',
    '/members/:path*',
    '/preferences/:path*',
    '/planner/:path*',
    '/shopping/:path*',
    '/recommend/:path*',
    '/nutrition/:path*',
    '/auth/:path*',
  ],
};
