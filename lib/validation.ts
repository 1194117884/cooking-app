import { ZodIssue } from 'zod';

/**
 * 格式化Zod验证错误为用户友好的错误消息
 * @param issues Zod验证问题数组
 * @returns 格式化的错误消息
 */
export function formatZodErrors(issues: ZodIssue[]): string {
  const errors = issues.map(issue => {
    const field = issue.path.join('.');
    const message = issue.message;
    return `${field}: ${message}`;
  });

  return errors.join('; ');
}

/**
 * 清理用户输入数据
 * @param input 用户输入
 * @returns 清理后的数据
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // 去除首尾空白字符
  let sanitized = input.trim();

  // 防止脚本注入，移除潜在危险的HTML标签
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  return sanitized;
}

/**
 * 验证用户输入的通用函数
 * @param data 待验证的数据
 * @param schema Zod验证模式
 * @returns 验证结果
 */
export function validateInput<T>(
  data: unknown,
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: any } }
): { success: boolean; data?: T; error?: string } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errorMessage = formatZodErrors(result.error.issues);
    return { success: false, error: errorMessage };
  }

  return { success: true, data: result.data };
}

/**
 * 验证ID参数
 * @param id 待验证的ID
 * @returns 是否为有效ID
 */
export function validateId(id: string): boolean {
  // 验证UUID格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * 验证查询参数
 * @param params 查询参数
 * @returns 验证后的安全参数
 */
export function validateQueryParams(params: Record<string, string | undefined>): Record<string, string> {
  const validated: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      // 验证键名，防止恶意参数名
      if (/^[a-zA-Z0-9_-]+$/.test(key)) {
        validated[key] = sanitizeInput(value);
      }
    }
  }

  return validated;
}