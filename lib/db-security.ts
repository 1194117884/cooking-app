import { Prisma } from '@prisma/client';

/**
 * 验证和清理数据库查询参数
 * @param params 查询参数
 * @returns 验证后的安全参数
 */
export function validateQueryParams(params: Record<string, any>): Record<string, any> {
  const validated: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    // 验证键名
    if (typeof key === 'string' && /^[a-zA-Z0-9_-]+$/.test(key)) {
      validated[key] = validateAndSanitizeValue(value);
    }
  }

  return validated;
}

/**
 * 验证和清理单个值
 * @param value 待验证的值
 * @returns 验证后的安全值
 */
function validateAndSanitizeValue(value: any): any {
  if (typeof value === 'string') {
    // 清理字符串值
    return value.trim().substring(0, 1000); // 限制最大长度
  } else if (typeof value === 'number') {
    // 验证数值范围
    if (isNaN(value) || !isFinite(value)) {
      return 0;
    }
    return value;
  } else if (typeof value === 'boolean') {
    return value;
  } else if (Array.isArray(value)) {
    return value.map(validateAndSanitizeValue);
  } else if (value === null || value === undefined) {
    return value;
  } else {
    // 对于其他类型的值，转换为字符串并清理
    return String(value).trim().substring(0, 1000);
  }
}

/**
 * 安全地构建 Prisma 查询条件
 * @param filters 过滤条件
 * @returns 安全的 Prisma 查询对象
 */
export function buildSafeWhereClause(filters: Record<string, any>): Prisma.Sql {
  const conditions: string[] = [];
  const params: any[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      // 验证字段名，只允许预定义的字段
      if (isValidFieldName(key)) {
        if (Array.isArray(value)) {
          // 处理 IN 查询
          const placeholders = value.map((_, index) => `$${params.length + index + 1}`).join(',');
          conditions.push(`${key} IN (${placeholders})`);
          params.push(...value);
        } else {
          // 处理相等查询
          conditions.push(`${key} = $${params.length + 1}`);
          params.push(value);
        }
      }
    }
  }

  if (conditions.length === 0) {
    return Prisma.empty;
  }

  const sqlString = conditions.join(' AND ');
  return Prisma.sql([`WHERE ${sqlString}`, ...params]);
}

/**
 * 验证字段名是否安全
 * @param fieldName 字段名
 * @returns 是否为有效的字段名
 */
function isValidFieldName(fieldName: string): boolean {
  // 仅允许字母、数字和下划线组成的字段名
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(fieldName);
}

/**
 * 限制查询结果数量
 * @param limit 限制数量
 * @returns 安全的数量值
 */
export function validateLimit(limit: number | undefined): number {
  if (limit === undefined) {
    return 100; // 默认限制
  }

  const numLimit = Number(limit);
  if (isNaN(numLimit) || numLimit < 1) {
    return 100;
  }

  return Math.min(numLimit, 1000); // 最大限制
}

/**
 * 验证分页偏移量
 * @param offset 偏移量
 * @returns 安全的偏移量值
 */
export function validateOffset(offset: number | undefined): number {
  if (offset === undefined) {
    return 0;
  }

  const numOffset = Number(offset);
  if (isNaN(numOffset) || numOffset < 0) {
    return 0;
  }

  return numOffset;
}