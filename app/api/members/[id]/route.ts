import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthenticatedRequest, withAuthAndErrorHandler, createErrorResponse } from '@/lib/api-wrapper';

// 更新家庭成员
async function updateMember(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = req.userId;
  const body = await req.json();
  const { name, role, avatarColor, dietaryGoal, isActive } = body;

  // 验证成员属于当前用户
  const existing = await prisma.familyMember.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return createErrorResponse('NOT_FOUND', '成员不存在', 404);
  }

  const member = await prisma.familyMember.update({
    where: { id },
    data: {
      name,
      role,
      avatarColor,
      dietaryGoal,
      isActive,
    },
  });

  return NextResponse.json({ member });
}

// 删除家庭成员
async function deleteMember(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = req.userId;

  // 验证成员属于当前用户
  const existing = await prisma.familyMember.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return createErrorResponse('NOT_FOUND', '成员不存在', 404);
  }

  await prisma.familyMember.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

// 导出包装后的处理器
export const PATCH = withAuthAndErrorHandler(updateMember);
export const DELETE = withAuthAndErrorHandler(deleteMember);
