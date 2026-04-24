import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

// 删除偏好
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // 验证 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // 验证偏好属于当前用户的家庭成员
    const preference = await prisma.preference.findUnique({
      where: { id },
      include: {
        member: {
          select: { userId: true },
        },
      },
    });

    if (!preference || preference.member.userId !== decoded.userId) {
      return NextResponse.json({ error: '偏好不存在' }, { status: 404 });
    }

    await prisma.preference.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete preference error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
