import { NextResponse } from 'next/server';
import { ApiResponse, PaginatedApiResponse } from '@/types';

/**
 * 创建成功的API响应
 */
export function createSuccessResponse<T = any>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };

  return NextResponse.json(response, { status });
}

/**
 * 创建错误的API响应
 */
export function createErrorResponse(
  error: string,
  message?: string,
  status: number = 400
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error,
    message,
  };

  return NextResponse.json(response, { status });
}

/**
 * 创建分页响应
 */
export function createPaginatedResponse<T = any>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
): NextResponse<PaginatedApiResponse<T>> {
  const totalPages = Math.ceil(total / limit);

  const response: PaginatedApiResponse<T> = {
    success: true,
    data,
    message,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    }
  };

  return NextResponse.json(response);
}

/**
 * 安全地从请求中提取JSON数据
 */
export async function safeJsonParse(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * 验证请求方法
 */
export function validateRequestMethod(
  request: Request,
  allowedMethods: string[]
): void {
  const method = request.method;
  if (!allowedMethods.includes(method)) {
    throw new Error(`Method ${method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`);
  }
}

/**
 * 从请求头安全地提取用户信息
 */
export function extractUserFromHeaders(headers: Headers): { userId?: string; email?: string } | null {
  const authHeader = headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // 在实际应用中，这里应该验证JWT并解码用户信息
  // 由于我们不处理JWT细节，这里返回一个模拟的用户信息
  const token = authHeader.substring(7);

  // 这里应该实际验证token并返回用户信息
  // 返回模拟数据作为示例
  return { userId: 'mock-user-id', email: 'mock@example.com' };
}

/**
 * 格式化日期为ISO字符串（忽略时区）
 */
export function formatDate(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
}

/**
 * 从URL中安全地提取路径参数
 */
export function extractPathParams(url: string, pattern: string): Record<string, string> {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;

  // 简单的参数提取，实际实现可能需要更复杂的路由匹配
  const params: Record<string, string> = {};

  // 例如，如果pattern是 "/api/users/:id/recipes/:recipeId"
  // 我们需要匹配并提取:id和:recipeId的值
  const patternSegments = pattern.split('/');
  const pathSegments = pathname.split('/');

  if (patternSegments.length !== pathSegments.length) {
    return params; // 不匹配
  }

  for (let i = 0; i < patternSegments.length; i++) {
    if (patternSegments[i].startsWith(':')) {
      const paramName = patternSegments[i].substring(1);
      params[paramName] = pathSegments[i];
    }
  }

  return params;
}

/**
 * 验证和规范化查询参数
 */
export function normalizeQueryParams(
  params: Record<string, string | string[] | undefined>
): Record<string, string> {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        normalized[key] = value[0] || ''; // 取第一个值
      } else {
        normalized[key] = value;
      }
    }
  }

  return normalized;
}

/**
 * 限制字符串长度
 */
export function truncateString(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) {
    return str;
  }

  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * 深度克隆对象（注意：不适用于包含循环引用的对象）
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }

  if (typeof obj === 'object') {
    const cloned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}