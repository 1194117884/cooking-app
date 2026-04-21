/**
 * 前端 API 客户端 - 统一封装 fetch，自动处理认证和错误
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// 统一错误响应类型
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// API 客户端选项
interface ApiClientOptions extends RequestInit {
  // 是否需要认证，默认为 true
  requireAuth?: boolean;
  // 是否显示错误提示
  showToast?: boolean;
}

// 全局错误处理器 - 可以被外部设置
let globalErrorHandler: ((error: ApiError) => void) | null = null;

// 设置全局错误处理器
export function setGlobalErrorHandler(handler: (error: ApiError) => void) {
  globalErrorHandler = handler;
}

/**
 * 从 localStorage 获取 token
 */
function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('token');
}

/**
 * 检查 token 是否过期
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // 转换为毫秒
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

/**
 * 清除认证信息并重定向到登录页
 */
function clearAuthAndRedirect(redirectPath?: string) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');

  const currentPath = redirectPath || window.location.pathname;
  const redirectParam = currentPath !== '/auth/login' ? `?redirect=${encodeURIComponent(currentPath)}` : '';

  // 延迟跳转，让用户看到提示
  setTimeout(() => {
    window.location.href = `/auth/login${redirectParam}`;
  }, 100);
}

/**
 * 显示错误提示（简单的 toast 实现）
 */
function showErrorToast(message: string) {
  if (typeof window === 'undefined') {
    return;
  }

  // 检查是否有全局错误处理器
  if (globalErrorHandler) {
    globalErrorHandler({ code: 'ERROR', message });
    return;
  }

  // 简单的 toast 实现
  const existingToast = document.getElementById('api-error-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'api-error-toast';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ef4444;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    font-size: 14px;
    max-width: 90%;
    text-align: center;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * 基础请求方法
 */
async function request<T>(
  url: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { requireAuth = true, showToast = true, ...fetchOptions } = options;

  // 构建完整 URL
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  // 准备 headers
  const headers = new Headers(fetchOptions.headers);

  // 默认 Content-Type
  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json');
  }

  // 添加认证 token 到自定义 header
  if (requireAuth) {
    const token = getStoredToken();

    if (token) {
      // 检查 token 是否过期
      if (isTokenExpired(token)) {
        // Token 过期，清除并重定向
        if (showToast) {
          showErrorToast('登录已过期，请重新登录');
        }
        clearAuthAndRedirect();
        throw new Error('登录已过期');
      }

      headers.set('ck-token', token);
    }
  }

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
    });

    // 处理 401 未授权
    if (response.status === 401) {
      const data = await response.json().catch(() => ({ error: { message: '未授权访问' } }));

      if (showToast) {
        showErrorToast(data.error?.message || '登录已过期，请重新登录');
      }

      clearAuthAndRedirect();
      throw new Error('UNAUTHORIZED');
    }

    // 解析响应
    const data = await response.json();

    // 处理其他错误
    if (!response.ok) {
      const error: ApiError = data.error || { code: 'UNKNOWN', message: '请求失败' };

      if (showToast && error.code !== 'UNAUTHORIZED') {
        showErrorToast(error.message);
      }

      throw error;
    }

    return data as T;
  } catch (error: any) {
    // 如果是已知的 API 错误，直接抛出
    if (error.code) {
      throw error;
    }

    // 网络错误等其他错误
    if (showToast && error.message !== '登录已过期' && error.message !== 'UNAUTHORIZED') {
      showErrorToast('网络错误，请稍后重试');
    }

    throw { code: 'NETWORK_ERROR', message: error.message || '网络错误' };
  }
}

/**
 * API 客户端
 */
export const api = {
  /**
   * GET 请求
   */
  get: <T>(url: string, options?: ApiClientOptions): Promise<T> =>
    request<T>(url, { ...options, method: 'GET' }),

  /**
   * POST 请求
   */
  post: <T>(url: string, body?: any, options?: ApiClientOptions): Promise<T> =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PUT 请求
   */
  put: <T>(url: string, body?: any, options?: ApiClientOptions): Promise<T> =>
    request<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PATCH 请求
   */
  patch: <T>(url: string, body?: any, options?: ApiClientOptions): Promise<T> =>
    request<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * DELETE 请求
   */
  delete: <T>(url: string, options?: ApiClientOptions): Promise<T> =>
    request<T>(url, { ...options, method: 'DELETE' }),

  /**
   * 原始 request 方法
   */
  request,
};

// 兼容旧代码的导出
export async function getAuthToken(): Promise<string> {
  const token = getStoredToken();
  if (!token) {
    throw new Error('用户未认证');
  }
  if (isTokenExpired(token)) {
    clearAuthAndRedirect();
    throw new Error('登录已过期');
  }
  return token;
}

export async function getAuthHeaders(): Promise<{ Authorization: string }> {
  const token = await getAuthToken();
  return { Authorization: `Bearer ${token}` };
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
