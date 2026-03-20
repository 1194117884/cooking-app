/**
 * 获取认证头部，优先从cookie获取token，如果cookie不可用则尝试localStorage
 * @returns 包含认证头部的对象
 */
export async function getAuthHeaders(): Promise<{ Authorization: string }> {
  // 在客户端环境中，尝试从cookie获取token
  // 但由于浏览器安全限制，我们无法直接读取httpOnly cookie
  // 因此首先尝试从localStorage获取（用于SPA）

  if (typeof window !== 'undefined') {
    // 浏览器环境
    const token = localStorage.getItem('token');
    if (token) {
      return { 'Authorization': `Bearer ${token}` };
    }

    // 如果localStorage中也没有token，则尝试从服务端获取
    // 这里可以调用一个API端点来获取用户信息
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user && data.token) {
          // 如果API返回了新token，保存到localStorage
          localStorage.setItem('token', data.token);
          return { 'Authorization': `Bearer ${data.token}` };
        }
      }
    } catch (error) {
      console.error('获取认证信息失败:', error);
    }
  }

  // 如果所有方法都失败，返回空认证头部
  return { 'Authorization': '' };
}

/**
 * 获取认证token，使用统一的方法处理localStorage和API retrieval
 * @returns 认证token
 */
export async function getAuthToken(): Promise<string> {
  // 在浏览器环境中，尝试从localStorage获取token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      return token;
    }
  }

  // 如果没有找到token，尝试获取认证状态以获取新token
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        // 如果API返回了新token，保存到localStorage
        localStorage.setItem('token', data.token);
        return data.token;
      }
    }
  } catch (error) {
    console.error('获取认证信息失败:', error);
  }

  throw new Error('用户未认证');
}

/**
 * 清除认证信息
 */
export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

/**
 * 验证用户是否已认证
 * @returns 用户是否已认证
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();
    if (!headers.Authorization) {
      return false;
    }

    const response = await fetch('/api/auth/me', {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('验证认证状态失败:', error);
    return false;
  }
}