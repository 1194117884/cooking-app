import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

// 获取偏好列表
export async function GET(request: Request) {
  try {
    // 验证 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // 获取用户的所有家庭成员
    const members = await prisma.familyMember.findMany({
      where: { userId: decoded.userId },
      include: {
        preferences: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

// 添加偏好
export async function POST(request: Request) {
  try {
    // 验证 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const body = await request.json();
    const { memberId, type, category, value, intensity } = body;

    // 验证家庭成员属于当前用户
    const member = await prisma.familyMember.findFirst({
      where: { id: memberId, userId: decoded.userId },
    });

    if (!member) {
      return NextResponse.json({ error: '家庭成员不存在' }, { status: 404 });
    }

    // 创建偏好
    const preference = await prisma.preference.create({
      data: {
        memberId,
        type,
        category,
        value,
        intensity: intensity || 3,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ preference });
  } catch (error: any) {
    console.error('Create preference error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: '该偏好已存在' }, { status: 400 });
    }
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
