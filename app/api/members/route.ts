import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthenticatedRequest, withAuthAndErrorHandler } from '@/lib/api-wrapper';

// 获取家庭成员列表
async function getMembers(req: AuthenticatedRequest, _context: { params: Promise<{}> }) {
  const userId = req.userId;

  const members = await prisma.familyMember.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ members });
}

// 添加家庭成员
async function createMember(req: AuthenticatedRequest, _context: { params: Promise<{}> }) {
  const userId = req.userId;
  const body = await req.json();
  const { name, role, avatarColor, dietaryGoal } = body;

  if (!name) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '姓名为必填' } },
      { status: 400 }
    );
  }

  const member = await prisma.familyMember.create({
    data: {
      userId,
      name,
      role: role || 'ADULT',
      avatarColor: avatarColor || '#3b82f6',
      dietaryGoal,
    },
  });

  return NextResponse.json({ member });
}

// 导出包装后的处理器
export const GET = withAuthAndErrorHandler(getMembers);
export const POST = withAuthAndErrorHandler(createMember);
