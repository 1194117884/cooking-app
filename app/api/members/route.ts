import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

// 获取家庭成员列表
export async function GET(request: Request) {
  try {
    // 验证 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const members = await prisma.familyMember.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

// 添加家庭成员
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
    const { name, role, avatarColor, dietaryGoal } = body;

    if (!name) {
      return NextResponse.json({ error: '姓名为必填' }, { status: 400 });
    }

    const member = await prisma.familyMember.create({
      data: {
        userId: decoded.userId,
        name,
        role: role || 'ADULT',
        avatarColor: avatarColor || '#3b82f6',
        dietaryGoal,
      },
    });

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Create member error:', error);
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: '该成员已存在' }, { status: 400 });
    }
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
