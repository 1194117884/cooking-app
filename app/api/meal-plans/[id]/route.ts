import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthenticatedRequest, withAuthAndErrorHandler, createErrorResponse } from '@/lib/api-wrapper';

// 删除餐食计划
async function deleteMealPlan(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  const userId = req.userId;

  // 验证计划属于当前用户
  const existing = await prisma.mealPlan.findFirst({
    where: { id: params.id, userId },
  });

  if (!existing) {
    return createErrorResponse('NOT_FOUND', '计划不存在', 404);
  }

  await prisma.mealPlan.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}

// 导出包装后的处理器
export const DELETE = withAuthAndErrorHandler(deleteMealPlan);
