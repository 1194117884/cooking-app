/**
 * @deprecated 请使用 lib/api-client.ts 中的 api 对象
 * 此文件保留用于向后兼容
 */

import { api, getAuthToken, getAuthHeaders, clearAuth } from './api-client';

// 重新导出以保持向后兼容
export { api, getAuthToken, getAuthHeaders, clearAuth };

/**
 * @deprecated 请使用 api 对象或直接检查 localStorage
 * 验证用户是否已认证
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getAuthToken();
    return true;
  } catch {
    return false;
  }
}
