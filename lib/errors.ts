/**
 * 应用程序错误类型
 */
export enum AppErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',

  // 用户相关错误
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_EXISTS = 'USER_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // 数据库错误
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNIQUE_CONSTRAINT_VIOLATION = 'UNIQUE_CONSTRAINT_VIOLATION',

  // 业务逻辑错误
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  INVALID_INPUT = 'INVALID_INPUT',
}

/**
 * 应用程序错误类
 */
export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    code: AppErrorCode = AppErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // 维护原型链
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 创建错误响应
 */
export function createErrorResponse(error: AppError | Error) {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
      timestamp: new Date().toISOString(),
    };
  }

  // 对于未知错误，只返回通用消息
  return {
    error: {
      code: AppErrorCode.UNKNOWN_ERROR,
      message: 'An unexpected error occurred',
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * 错误处理器
 */
export function handleError(error: unknown): AppError {
  // 如果已经是AppError，直接返回
  if (error instanceof AppError) {
    return error;
  }

  // 如果是Prisma错误，转换为适当的AppError
  if (isPrismaError(error)) {
    return handlePrismaError(error);
  }

  // 如果是验证错误
  if (isValidationError(error)) {
    return new AppError(
      'Invalid input data',
      AppErrorCode.VALIDATION_ERROR,
      400,
      { details: error }
    );
  }

  // 其他错误视为未知错误
  console.error('Unhandled error:', error);
  return new AppError(
    'An unexpected error occurred',
    AppErrorCode.UNKNOWN_ERROR,
    500
  );
}

/**
 * 检查是否为Prisma错误
 */
function isPrismaError(error: unknown): error is any {
  return typeof error === 'object' && error !== null && 'code' in error && 'meta' in error;
}

/**
 * 处理Prisma错误
 */
function handlePrismaError(error: any): AppError {
  // Unique constraint violation
  if (error.code === 'P2002') {
    return new AppError(
      'Data already exists',
      AppErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
      409
    );
  }

  // Record not found
  if (error.code === 'P2025') {
    return new AppError(
      'Record not found',
      AppErrorCode.NOT_FOUND,
      404
    );
  }

  // 其他数据库错误
  return new AppError(
    'Database error occurred',
    AppErrorCode.DATABASE_ERROR,
    500,
    { prismaCode: error.code, meta: error.meta }
  );
}

/**
 * 检查是否为验证错误
 */
function isValidationError(error: unknown): error is any {
  return typeof error === 'object' && error !== null && 'issues' in error;
}

/**
 * 验证中间件
 */
export function withValidation<T>(
  validate: (data: any) => { success: boolean; data?: T; error?: string },
  handler: (data: T) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    try {
      const body = await request.json();
      const validationResult = validate(body);

      if (!validationResult.success) {
        return new Response(
          JSON.stringify(createErrorResponse(
            new AppError(
              validationResult.error || 'Validation failed',
              AppErrorCode.VALIDATION_ERROR,
              400
            )
          )),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return await handler(validationResult.data!);
    } catch (error) {
      const appError = handleError(error);
      return new Response(
        JSON.stringify(createErrorResponse(appError)),
        { status: appError.statusCode, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

/**
 * 认证中间件
 */
export async function withAuth(
  handler: (userId: string, request: Request) => Promise<Response>,
  requireValidSession: boolean = true
): Promise<Response> {
  try {
    // 在这里我们需要实际的验证逻辑，这只是一个框架
    // 实际实现需要结合JWT验证函数
    throw new AppError('Not implemented', AppErrorCode.AUTHENTICATION_ERROR, 401);
  } catch (error) {
    const appError = handleError(error);
    return new Response(
      JSON.stringify(createErrorResponse(appError)),
      { status: appError.statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
}