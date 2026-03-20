import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { AppError, handleError, createErrorResponse } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const userId = await verifyToken(request as Request & { headers: Headers; cookies: any });

    if (!userId) {
      throw new AppError(
        '未授权访问',
        AppError.AUTHENTICATION_ERROR,
        401
      );
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        familyMembers: {
          select: {
            id: true,
            name: true,
            role: true,
            avatarColor: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(
        '用户不存在',
        AppError.USER_NOT_FOUND,
        404
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    const appError = handleError(error);

    return NextResponse.json(
      createErrorResponse(appError),
      { status: appError.statusCode }
    );
  }
}
