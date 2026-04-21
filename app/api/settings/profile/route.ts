import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthenticatedRequest, withAuthAndErrorHandler, createErrorResponse } from '@/lib/api-wrapper';

// 更新用户信息
async function updateProfile(req: AuthenticatedRequest) {
  const userId = req.userId;
  const body = await req.json();
  const { name, email } = body;

  // 检查邮箱是否已被其他用户使用
  if (email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId },
      },
    });

    if (existingUser) {
      return createErrorResponse('DUPLICATE_ENTRY', '该邮箱已被使用', 409);
    }
  }

  // 更新用户信息
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user });
}

// 导出包装后的处理器
export const PATCH = withAuthAndErrorHandler(updateProfile);
