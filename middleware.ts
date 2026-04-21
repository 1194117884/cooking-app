import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要认证的路由（用于 API 层面的认证，而非页面跳转）
// 页面加载不再被拦截，认证由后端 API 和前端切面统一处理
export function middleware(request: NextRequest) {
  // 如果已登录访问认证页面，重定向到首页
  // 这里只处理已登录用户的页面访问优化，不强拦截未认证用户
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // 如果已登录且访问登录/注册页，重定向到首页
  if (pathname.startsWith('/auth') && token) {
    // 尝试验证 token 是否有效
    try {
      return NextResponse.redirect(new URL('/', request.url));
    } catch {
      // token 无效，允许访问登录页
    }
  }

  // 不再拦截任何页面访问，认证完全由 API 层处理
  // 后端切面：API 自动验证 token，返回 401
  // 前端切面：fetch 自动捕获 401，跳转登录页
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth/:path*',
  ],
};

