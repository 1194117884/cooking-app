import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set');
}

// 扩展 NextRequest 类型，添加 userId
export interface AuthenticatedRequest extends NextRequest {
  userId: string;
}

// 统一错误响应格式
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// 创建统一错误响应
export function createErrorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: any
): NextResponse {
  const response: ApiErrorResponse = {
    error: { code, message },
    timestamp: new Date().toISOString(),
  };

  if (details) {
    response.error.details = details;
  }

  return NextResponse.json(response, { status });
}

// 从请求中提取并验证 token
async function extractUserId(request: NextRequest): Promise<string | null> {
  try {
    // 尝试从自定义 ck-token header 获取 token
    const token = request.headers.get('ck-token');
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded.userId;
    }

    // 保留对旧 Authorization header 的兼容
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7);
      const decoded = jwt.verify(bearerToken, JWT_SECRET) as { userId: string };
      return decoded.userId;
    }

    return null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * 认证包装器 - 自动验证并注入 userId
 * 需要认证的 API 路由使用此包装器
 */
export function withAuth<
  TParams = {},
  TResult = Response
>(
  handler: (req: AuthenticatedRequest, params: TParams) => Promise<TResult>
): (req: NextRequest, params: TParams) => Promise<TResult | NextResponse> {
  return async (req: NextRequest, params: TParams) => {
    const userId = await extractUserId(req);

    if (!userId) {
      return createErrorResponse(
        'UNAUTHORIZED',
        '认证失败，请重新登录',
        401
      ) as unknown as TResult;
    }

    // 将 userId 注入到请求对象
    (req as AuthenticatedRequest).userId = userId;

    return handler(req as AuthenticatedRequest, params);
  };
}

/**
 * 可选认证包装器 - 有 token 则注入 userId，无则 userId 为 undefined
 * 部分需要认证但也可以匿名访问的 API 使用此包装器
 */
export function withOptionalAuth<
  TParams = {},
  TResult = Response
>(
  handler: (req: AuthenticatedRequest | NextRequest, params: TParams) => Promise<TResult>
): (req: NextRequest, params: TParams) => Promise<TResult> {
  return async (req: NextRequest, params: TParams) => {
    const userId = await extractUserId(req);

    if (userId) {
      (req as AuthenticatedRequest).userId = userId;
    }

    return handler(req as AuthenticatedRequest | NextRequest, params);
  };
}

/**
 * 错误处理包装器 - 统一捕获并格式化错误
 * 所有 API 路由都应该使用此包装器
 */
export function withErrorHandler<
  TParams = {},
  TResult = Response
>(
  handler: (req: NextRequest, params: TParams) => Promise<TResult>
): (req: NextRequest, params: TParams) => Promise<TResult | NextResponse> {
  return async (req: NextRequest, params: TParams) => {
    try {
      return await handler(req, params);
    } catch (error: any) {
      console.error('API Error:', error);

      // JWT 过期错误
      if (error.name === 'TokenExpiredError') {
        return createErrorResponse(
          'TOKEN_EXPIRED',
          '登录已过期，请重新登录',
          401
        ) as unknown as TResult;
      }

      // JWT 无效错误
      if (error.name === 'JsonWebTokenError') {
        return createErrorResponse(
          'INVALID_TOKEN',
          '无效的登录凭证',
          401
        ) as unknown as TResult;
      }

      // Prisma 唯一约束错误
      if (error.code === 'P2002') {
        return createErrorResponse(
          'DUPLICATE_ENTRY',
          '数据已存在',
          409,
          { fields: error.meta?.target }
        ) as unknown as TResult;
      }

      // Prisma 记录不存在错误
      if (error.code === 'P2025') {
        return createErrorResponse(
          'NOT_FOUND',
          '记录不存在',
          404
        ) as unknown as TResult;
      }

      // 开发环境返回详细错误
      if (process.env.NODE_ENV !== 'production') {
        return createErrorResponse(
          'INTERNAL_ERROR',
          error.message || '服务器内部错误',
          500,
          { stack: error.stack }
        ) as unknown as TResult;
      }

      // 生产环境只返回通用错误
      return createErrorResponse(
        'INTERNAL_ERROR',
        '服务器内部错误，请稍后重试',
        500
      ) as unknown as TResult;
    }
  };
}

/**
 * 组合包装器 - 同时应用错误处理和认证
 * 需要认证的路由使用此包装器
 */
export function withAuthAndErrorHandler<
  TParams = {},
  TResult = Response
>(
  handler: (req: AuthenticatedRequest, params: TParams) => Promise<TResult>
): (req: NextRequest, params: TParams) => Promise<TResult | NextResponse> {
  return withErrorHandler(withAuth(handler));
}
