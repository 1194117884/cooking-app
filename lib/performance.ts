import { Redis } from 'ioredis'; // 如果使用Redis
import { Prisma } from '@prisma/client';

// 缓存配置
interface CacheConfig {
  ttl?: number; // 过期时间（秒）
  staleTtl?: number; // 暂留时间（秒）
}

// 简单内存缓存实现（生产环境建议使用Redis）
class SimpleCache {
  private cache: Map<string, { value: any; expiresAt: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> { // 默认5分钟
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttl * 1000),
    });
  }

  async invalidate(pattern: string): Promise<void> {
    // 简单实现，实际可能需要更复杂的模式匹配
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new SimpleCache();

/**
 * 带缓存的数据库查询
 */
export async function cachedDbQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  config: CacheConfig = {}
): Promise<T> {
  const { ttl = 300 } = config; // 默认5分钟

  // 尝试从缓存获取
  const cachedResult = await cache.get<T>(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  // 执行查询
  const result = await queryFn();

  // 存储到缓存
  await cache.set(cacheKey, result, ttl);

  return result;
}

/**
 * 数据库查询优化工具
 */
export class QueryOptimizer {
  /**
   * 添加适当的索引提示和查询优化
   */
  static async optimizeFindMany<T>(
    model: any,
    args: Prisma.Args<T, 'findMany'>,
    cacheEnabled: boolean = false,
    cacheTtl: number = 300
  ): Promise<any> {
    const cacheKey = this.generateCacheKey(model, args);

    if (cacheEnabled) {
      return await cachedDbQuery(cacheKey, () => model.findMany(args), { ttl: cacheTtl });
    }

    return await model.findMany(args);
  }

  /**
   * 优化单一记录查询
   */
  static async optimizeFindUnique<T>(
    model: any,
    args: Prisma.Args<T, 'findUnique'>,
    cacheEnabled: boolean = true,
    cacheTtl: number = 600
  ): Promise<any> {
    const cacheKey = this.generateCacheKey(model, args);

    if (cacheEnabled) {
      return await cachedDbQuery(cacheKey, () => model.findUnique(args), { ttl: cacheTtl });
    }

    return await model.findUnique(args);
  }

  /**
   * 生成缓存键
   */
  private static generateCacheKey(model: any, args: any): string {
    // 简化版缓存键生成，实际可能需要更复杂的方法
    return `${model.name}_${JSON.stringify(args)}`;
  }
}

/**
 * 数据预加载优化器
 */
export class DataLoader {
  /**
   * 批量预加载相关数据，减少N+1查询问题
   */
  static async loadRelatedData<T>(
    items: T[],
    relationField: keyof T,
    fetchRelated: (ids: string[]) => Promise<any[]>
  ): Promise<T[]> {
    // 提取相关ID
    const relatedIds = Array.from(
      new Set(
        items
          .map(item => (item[relationField] as any)?.id || (item[relationField] as any))
          .filter(Boolean)
      )
    );

    if (relatedIds.length === 0) {
      return items;
    }

    // 批量获取相关数据
    const relatedData = await fetchRelated(relatedIds as string[]);
    const relatedMap = new Map(relatedData.map(item => [item.id, item]));

    // 关联数据
    return items.map(item => {
      const itemId = (item[relationField] as any)?.id || (item[relationField] as any);
      if (itemId && relatedMap.has(itemId)) {
        (item as any)[relationField] = relatedMap.get(itemId);
      }
      return item;
    });
  }
}

/**
 * 分页优化
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function paginateQuery<T>(
  queryBuilder: any, // Prisma查询构建器
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const {
    page = 1,
    limit = 20,
    sortBy = 'id',
    sortOrder = 'desc'
  } = options;

  // 验证参数
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100); // 限制最大每页数量

  // 获取总数
  const total = await queryBuilder.count();

  // 计算分页
  const offset = (safePage - 1) * safeLimit;

  // 获取数据
  const data = await queryBuilder
    .orderBy({ [sortBy]: sortOrder })
    .skip(offset)
    .take(safeLimit);

  const totalPages = Math.ceil(total / safeLimit);

  return {
    data,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
  };
}

/**
 * 智能预加载优化
 */
export function smartInclude<T extends Record<string, any>>(
  baseInclude: T,
  requestedFields?: string[]
): T {
  if (!requestedFields || requestedFields.length === 0) {
    return baseInclude;
  }

  // 根据请求的字段动态构建include对象
  const smartIncludes: Record<string, any> = {};

  for (const field of requestedFields) {
    // 模拟解析嵌套字段
    if (baseInclude[field]) {
      smartIncludes[field] = baseInclude[field];
    }
  }

  return smartIncludes as T;
}

/**
 * 图像优化工具（虚拟实现，实际需要后端服务支持）
 */
export class ImageOptimizer {
  static async optimizeImage(
    imageUrl: string,
    width?: number,
    height?: number,
    quality: number = 80
  ): Promise<string> {
    // 这里通常会调用图像优化服务的API
    // 示例实现只是返回原URL加上参数
    const params = new URLSearchParams();

    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', quality.toString());

    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}${params.toString()}`;
  }

  static async generateSrcSet(
    baseUrl: string,
    sizes: number[],
    quality: number = 80
  ): Promise<string> {
    const srcSetParts = sizes.map(size =>
      `${this.optimizeImage(baseUrl, size, undefined, quality)} ${size}w`
    );

    return srcSetParts.join(', ');
  }
}