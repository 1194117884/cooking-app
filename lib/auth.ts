import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { sanitizeInput, sanitizeRichInput } from './validation'; // Import the enhanced sanitization functions

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set');
}
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * 验证请求中的JWT令牌 (Async version for API routes)
 * @param request Next.js请求对象
 * @returns 解码后的用户ID，如果验证失败则返回null
 */
export async function verifyToken(request: NextRequest): Promise<string | null> {
  try {
    // 尝试从 Authorization header 获取 token
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded.userId;
    }

    // 尝试从 cookie 获取 token
    const token = request.cookies.get('token')?.value;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded.userId;
    }

    return null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * 验证请求中的JWT令牌 (Sync version for middleware)
 * @param request Next.js请求对象
 * @returns 解码后的用户ID，如果验证失败则返回null
 */
export function verifyTokenSync(request: NextRequest): string | null {
  try {
    // 尝试从 cookie 获取 token
    const token = request.cookies.get('token')?.value;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded.userId;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * 验证请求中的JWT令牌并返回用户ID，如果验证失败则抛出错误
 * @param request Next.js请求对象
 * @returns 解码后的用户ID
 * @throws Error 如果验证失败
 */
export async function requireAuth(request: NextRequest): Promise<string> {
  const userId = await verifyToken(request);
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

/**
 * 生成JWT令牌
 * @param payload 令牌载荷
 * @returns 生成的令牌
 */
export function generateToken(payload: { userId: string; email: string }): string {
  return jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: '7d',
      issuer: 'cooking-app',
      audience: 'cooking-app-users'
    }
  );
}

/**
 * 验证密码强度
 * @param password 待验证的密码
 * @returns 验证结果和错误信息
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < 6) {
    return {
      isValid: false,
      error: '密码至少需要6位字符'
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      error: '密码长度不能超过128位'
    };
  }

  // 检查是否包含特殊字符（基本安全要求）
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  if (!(hasSpecialChar || hasUpperCase || hasLowerCase || hasNumbers)) {
    return {
      isValid: false,
      error: '密码应至少包含字母、数字或特殊字符中的两种'
    };
  }

  return { isValid: true };
}

/**
 * 验证邮箱格式
 * @param email 待验证的邮箱
 * @returns 验证结果
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Re-export sanitization functions so other modules can import them from auth
export { sanitizeInput, sanitizeRichInput };