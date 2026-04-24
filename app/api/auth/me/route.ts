import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { AppError, AppErrorCode, handleError, createErrorResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyToken(request);

    if (!userId) {
      throw new AppError(
        '未授权访问',
        AppErrorCode.AUTHENTICATION_ERROR,
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
        AppErrorCode.USER_NOT_FOUND,
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
