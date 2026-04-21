# 前后端切面权限管理系统

## 概述

实现了前后端切面权限管理系统，让业务开发专注于功能实现，无需关心认证和跳转逻辑。

## 设计原则

- **后端统一拦截**：所有需要认证的接口自动验证 JWT，自动注入 userId
- **前端统一处理**：所有请求自动添加 token，自动捕获 401 跳转登录页
- **错误格式统一**：前后端使用统一的错误响应格式
- **开发体验优化**：业务代码零感知认证逻辑

---

## 后端使用指南

### 1. 需要认证的路由

使用 `withAuthAndErrorHandler` 包装器：

```typescript
import { AuthenticatedRequest, withAuthAndErrorHandler } from '@/lib/api-wrapper';

async function handler(req: AuthenticatedRequest) {
  // req.userId 已自动注入
  const userId = req.userId;

  const data = await prisma.model.findMany({
    where: { userId }, // 直接使用，无需手动解析 token
  });

  return NextResponse.json({ data });
}

export const GET = withAuthAndErrorHandler(handler);
export const POST = withAuthAndErrorHandler(handler);
```

### 2. 可选认证的路由

使用 `withOptionalAuth`：

```typescript
import { withOptionalAuth, withErrorHandler } from '@/lib/api-wrapper';

export const GET = withErrorHandler(
  withOptionalAuth(async (req) => {
    // 有 token 时 req.userId 存在，无 token 时为 undefined
    const userId = (req as any).userId;

    if (userId) {
      // 返回个性化数据
    } else {
      // 返回公开数据
    }
  })
);
```

### 3. 统一错误响应

认证失败自动返回：

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "认证失败，请重新登录"
  },
  "timestamp": "2026-04-20T10:30:00.000Z"
}
```

错误码：
- `UNAUTHORIZED` - 未认证（401）
- `TOKEN_EXPIRED` - token 过期（401）
- `INVALID_TOKEN` - token 无效（401）
- `NOT_FOUND` - 记录不存在（404）
- `DUPLICATE_ENTRY` - 数据已存在（409）
- `VALIDATION_ERROR` - 参数验证失败（400）
- `INTERNAL_ERROR` - 服务器内部错误（500）

---

## 前端使用指南

### 1. 使用 API 客户端

```typescript
import { api } from '@/lib/api-client';

// GET 请求
const data = await api.get('/api/meal-plans');

// POST 请求
const result = await api.post('/api/meal-plans', {
  dayOfWeek: 1,
  mealType: 'LUNCH',
  recipeId: 'xxx'
});

// PATCH 请求
await api.patch(`/api/members/${id}`, { name: 'New Name' });

// DELETE 请求
await api.delete(`/api/meal-plans/${id}`);
```

### 2. 自动处理

- **自动添加 token**：从 localStorage 读取并添加到 Authorization header
- **自动检查过期**：token 过期时自动清除并重定向
- **自动处理 401**：返回 401 时显示提示并跳转登录页
- **自动错误提示**：显示 toast 错误消息

### 3. 错误处理

```typescript
try {
  const data = await api.post('/api/meal-plans', body);
} catch (error: any) {
  // 401 已被自动处理（跳转登录页）
  // 其他错误可以在这里处理
  if (error.code === 'VALIDATION_ERROR') {
    // 处理验证错误
  }
}
```

### 4. 向后兼容

原有 `getAuthToken` 和 `getAuthHeaders` 仍然可用，但建议使用新的 `api` 对象：

```typescript
// 旧方式（仍可用，但建议迁移）
import { getAuthToken, getAuthHeaders } from '@/lib/auth-client';

// 新方式（推荐）
import { api } from '@/lib/api-client';
```

---

## 迁移检查清单

### 后端迁移

- [ ] 导入 `withAuthAndErrorHandler` 包装器
- [ ] 将 handler 函数类型改为 `AuthenticatedRequest`
- [ ] 使用 `req.userId` 替代手动解析 token
- [ ] 导出包装后的处理器
- [ ] 删除重复的 token 验证代码
- [ ] 删除 try-catch 错误处理（已内置）

### 前端迁移

- [ ] 导入 `api` 客户端
- [ ] 将 `fetch` 替换为 `api.get/post/patch/delete`
- [ ] 删除手动 401 处理代码
- [ ] 删除手动 token 获取代码
- [ ] 简化错误处理逻辑

---

## 已迁移的文件

### 后端 API 路由

- ✅ `app/api/meal-plans/route.ts`
- ✅ `app/api/meal-plans/[id]/route.ts`
- ✅ `app/api/members/route.ts`
- ✅ `app/api/members/[id]/route.ts`
- ✅ `app/api/shopping-list/route.ts`
- ✅ `app/api/settings/profile/route.ts`

### 前端页面

- ✅ `app/page.tsx`
- ✅ `app/planner/page.tsx`
- ✅ `app/shopping/page.tsx`
- ✅ `app/settings/page.tsx`
- ✅ `app/members/page.tsx`

---

## 文件说明

### lib/api-wrapper.ts

后端切面核心，提供：
- `withAuth` - 认证包装器
- `withOptionalAuth` - 可选认证包装器
- `withErrorHandler` - 错误处理包装器
- `withAuthAndErrorHandler` - 组合包装器（推荐）
- `createErrorResponse` - 创建统一错误响应
- `AuthenticatedRequest` - 扩展的请求类型

### lib/api-client.ts

前端切面核心，提供：
- `api.get(url)` - GET 请求
- `api.post(url, body)` - POST 请求
- `api.patch(url, body)` - PATCH 请求
- `api.delete(url)` - DELETE 请求
- `api.request(url, options)` - 原始请求方法
- 自动 token 管理
- 自动 401 处理
- 自动错误提示

### lib/auth-client.ts

向后兼容文件，重新导出 `lib/api-client.ts` 的内容。
