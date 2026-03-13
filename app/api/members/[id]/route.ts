import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

// 更新家庭成员
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const body = await request.json();
    const { name, role, avatarColor, dietaryGoal, isActive } = body;

    // 验证成员属于当前用户
    const existing = await prisma.familyMember.findFirst({
      where: { id: params.id, userId: decoded.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: '成员不存在' }, { status: 404 });
    }

    const member = await prisma.familyMember.update({
      where: { id: params.id },
      data: {
        name,
        role,
        avatarColor,
        dietaryGoal,
        isActive,
      },
    });

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

// 删除家庭成员
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // 验证成员属于当前用户
    const existing = await prisma.familyMember.findFirst({
      where: { id: params.id, userId: decoded.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: '成员不存在' }, { status: 404 });
    }

    await prisma.familyMember.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
